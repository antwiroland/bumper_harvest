import { PurchaseStatus, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export class AnalyticsServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AnalyticsServiceError";
  }
}

function getPeriodStartDate(period: AnalyticsPeriod): Date {
  const days = Number(period.replace("d", ""));
  if (!Number.isFinite(days) || days <= 0) {
    throw new AnalyticsServiceError("Invalid analytics period", "BAD_REQUEST");
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export const analyticsService = {
  async getDashboardStats() {
    const now = new Date();
    const [
      totalUsers,
      totalAdmins,
      totalCategories,
      activeCategories,
      totalPackages,
      walletTotals,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.package.count(),
      prisma.wallet.aggregate({
        _sum: {
          balance: true,
        },
      }),
    ]);

    const [activePurchases, pendingSettlements, activeSubscriptions] = await Promise.all([
      prisma.packagePurchase.count({ where: { status: PurchaseStatus.ACTIVE } }),
      prisma.packagePurchase.count({
        where: {
          status: PurchaseStatus.ACTIVE,
          sellingWindowEnd: { lte: now },
        },
      }),
      prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    ]);

    const settlementStats = await this.getSettlementStats();

    return {
      users: {
        totalUsers,
        totalAdmins,
      },
      categories: {
        totalCategories,
        activeCategories,
      },
      packages: {
        totalPackages,
      },
      activity: {
        activePurchases,
        activeSubscriptions,
        pendingSettlements,
      },
      finance: {
        walletBalanceTotal: walletTotals._sum.balance ?? 0,
        totalSettlements: settlementStats.totalSettlements,
        totalPayout: settlementStats.totalPayout,
        totalCommission: settlementStats.totalCommission,
      },
    };
  },

  async getRevenueAnalytics(period: AnalyticsPeriod) {
    const startDate = getPeriodStartDate(period);
    const raw = (await prisma.settlementLog.aggregateRaw({
      pipeline: [
        {
          $match: {
            processedAt: { $gte: { $date: startDate.toISOString() } },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$processedAt",
              },
            },
            payout: { $sum: "$payout" },
            commission: { $sum: "$commission" },
            settlements: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ],
    })) as unknown as Array<{
      _id: string;
      payout: number;
      commission: number;
      settlements: number;
    }>;

    const timeline = raw.map((item) => ({
      date: item._id,
      payout: Number(item.payout.toFixed(2)),
      commission: Number(item.commission.toFixed(2)),
      grossRevenue: Number((item.payout + item.commission).toFixed(2)),
      settlements: item.settlements,
    }));

    const totals = timeline.reduce(
      (acc, item) => ({
        payout: acc.payout + item.payout,
        commission: acc.commission + item.commission,
        grossRevenue: acc.grossRevenue + item.grossRevenue,
        settlements: acc.settlements + item.settlements,
      }),
      { payout: 0, commission: 0, grossRevenue: 0, settlements: 0 },
    );

    return {
      period,
      startDate,
      endDate: new Date(),
      totals: {
        payout: Number(totals.payout.toFixed(2)),
        commission: Number(totals.commission.toFixed(2)),
        grossRevenue: Number(totals.grossRevenue.toFixed(2)),
        settlements: totals.settlements,
      },
      timeline,
    };
  },

  async getUserGrowth(period: AnalyticsPeriod) {
    const startDate = getPeriodStartDate(period);
    const raw = (await prisma.user.aggregateRaw({
      pipeline: [
        {
          $match: {
            createdAt: { $gte: { $date: startDate.toISOString() } },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
      ],
    })) as unknown as Array<{ _id: { date: string; role: "USER" | "ADMIN" }; count: number }>;

    const buckets = new Map<string, { users: number; admins: number }>();
    for (const row of raw) {
      const key = row._id.date;
      const current = buckets.get(key) ?? { users: 0, admins: 0 };
      if (row._id.role === "ADMIN") {
        current.admins += row.count;
      } else {
        current.users += row.count;
      }
      buckets.set(key, current);
    }

    const timeline = Array.from(buckets.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, value]) => ({
        date,
        users: value.users,
        admins: value.admins,
        total: value.users + value.admins,
      }));

    return {
      period,
      startDate,
      endDate: new Date(),
      totalNewUsers: timeline.reduce((sum, item) => sum + item.total, 0),
      timeline,
    };
  },

  async getCategoryPerformance() {
    const categories = await prisma.category.findMany({
      include: {
        packages: {
          include: {
            purchases: true,
          },
        },
        subscriptions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return categories.map((category) => {
      const purchases = category.packages.flatMap((pkg) => pkg.purchases);
      const totalPurchaseVolume = purchases.reduce(
        (sum, purchase) => sum + purchase.purchasePrice,
        0,
      );
      const totalExpectedProfit = purchases.reduce(
        (sum, purchase) => sum + purchase.expectedProfit,
        0,
      );
      const settledCount = purchases.filter(
        (item) => item.status === PurchaseStatus.SETTLED,
      ).length;
      const refundedCount = purchases.filter(
        (item) => item.status === PurchaseStatus.REFUNDED,
      ).length;

      return {
        categoryId: category.id,
        categoryName: category.name,
        isActive: category.isActive,
        packageCount: category.packages.length,
        subscriptions: category.subscriptions.length,
        activeSubscriptions: category.subscriptions.filter(
          (item) => item.status === SubscriptionStatus.ACTIVE,
        ).length,
        purchaseCount: purchases.length,
        settledCount,
        refundedCount,
        totalPurchaseVolume: Number(totalPurchaseVolume.toFixed(2)),
        totalExpectedProfit: Number(totalExpectedProfit.toFixed(2)),
      };
    });
  },

  async getSettlementStats() {
    const [totalSettlements, settledPurchases, refundedPurchases, aggregate] = await Promise.all([
      prisma.settlementLog.count(),
      prisma.packagePurchase.count({ where: { status: PurchaseStatus.SETTLED } }),
      prisma.packagePurchase.count({ where: { status: PurchaseStatus.REFUNDED } }),
      prisma.settlementLog.aggregate({
        _sum: {
          payout: true,
          commission: true,
        },
      }),
    ]);

    return {
      totalSettlements,
      settledPurchases,
      refundedPurchases,
      totalPayout: Number((aggregate._sum.payout ?? 0).toFixed(2)),
      totalCommission: Number((aggregate._sum.commission ?? 0).toFixed(2)),
    };
  },

  async getTopPerformingPackages(limit = 5) {
    const purchases = await prisma.packagePurchase.findMany({
      include: {
        package: {
          include: {
            category: true,
          },
        },
      },
    });

    const grouped = new Map<
      string,
      {
        packageId: string;
        packageName: string;
        categoryName: string;
        purchases: number;
        totalPurchaseVolume: number;
        totalExpectedProfit: number;
        avgCompletionPercent: number;
      }
    >();

    for (const purchase of purchases) {
      const item = grouped.get(purchase.packageId) ?? {
        packageId: purchase.packageId,
        packageName: purchase.package.name,
        categoryName: purchase.package.category.name,
        purchases: 0,
        totalPurchaseVolume: 0,
        totalExpectedProfit: 0,
        avgCompletionPercent: 0,
      };

      item.purchases += 1;
      item.totalPurchaseVolume += purchase.purchasePrice;
      item.totalExpectedProfit += purchase.expectedProfit;
      item.avgCompletionPercent += purchase.completionPercent;
      grouped.set(purchase.packageId, item);
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        totalPurchaseVolume: Number(item.totalPurchaseVolume.toFixed(2)),
        totalExpectedProfit: Number(item.totalExpectedProfit.toFixed(2)),
        avgCompletionPercent: Number((item.avgCompletionPercent / item.purchases).toFixed(2)),
      }))
      .sort((a, b) => b.totalPurchaseVolume - a.totalPurchaseVolume)
      .slice(0, Math.max(1, limit));
  },
};
