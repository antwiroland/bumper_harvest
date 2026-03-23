import { randomUUID } from "node:crypto";

import { Prisma, PurchaseStatus, TransactionType } from "@prisma/client";

import { SELLING_WINDOW_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { subscriptionService } from "@/lib/services/subscription.service";
import type { PurchaseQueryInput } from "@/lib/validations/purchase";

export class PurchaseServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "BAD_REQUEST"
      | "INSUFFICIENT_BALANCE"
      | "SUBSCRIPTION_REQUIRED",
  ) {
    super(message);
    this.name = "PurchaseServiceError";
  }
}

async function ensurePurchaseExists(id: string) {
  const purchase = await prisma.packagePurchase.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      package: {
        include: {
          category: true,
          products: true,
        },
      },
      salesRecords: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new PurchaseServiceError("Purchase not found", "NOT_FOUND");
  }

  return purchase;
}

function calculateExpectedProfit(
  products: Array<{ quantity: number; costPrice: number; sellingPrice: number }>,
) {
  return products.reduce((sum, item) => {
    return sum + item.quantity * (item.sellingPrice - item.costPrice);
  }, 0);
}

function calculateCompletion(salesRecords: Array<{ totalQuantity: number; soldQuantity: number }>) {
  const totalQuantity = salesRecords.reduce((sum, item) => sum + item.totalQuantity, 0);
  const soldQuantity = salesRecords.reduce((sum, item) => sum + item.soldQuantity, 0);
  const completionPercent = totalQuantity > 0 ? (soldQuantity / totalQuantity) * 100 : 0;

  return {
    totalQuantity,
    soldQuantity,
    completionPercent,
  };
}

export const purchaseService = {
  async getUserPurchases(userId: string) {
    return withPrismaRetry(() =>
      prisma.packagePurchase.findMany({
        where: { userId },
        include: {
          package: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    );
  },

  async getPurchaseById(id: string) {
    return ensurePurchaseExists(id);
  },

  async createPurchase(userId: string, packageId: string) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        category: true,
        products: true,
      },
    });

    if (!pkg || !pkg.isActive || !pkg.category.isActive) {
      throw new PurchaseServiceError("Package not available for purchase", "BAD_REQUEST");
    }

    if (pkg.products.length === 0) {
      throw new PurchaseServiceError("Package has no products", "BAD_REQUEST");
    }

    const hasSubscription = await subscriptionService.hasActiveSubscription(userId, pkg.categoryId);
    if (!hasSubscription) {
      throw new PurchaseServiceError(
        "Active category subscription required before purchase",
        "SUBSCRIPTION_REQUIRED",
      );
    }

    const purchasePrice = pkg.category.packagePrice;
    const expectedProfit = calculateExpectedProfit(pkg.products);
    const sellingWindowStart = new Date();
    const sellingWindowEnd = new Date(
      sellingWindowStart.getTime() + SELLING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (!wallet) {
        throw new PurchaseServiceError("Wallet not found", "BAD_REQUEST");
      }

      if (wallet.balance < purchasePrice) {
        throw new PurchaseServiceError(
          "Insufficient wallet balance for purchase",
          "INSUFFICIENT_BALANCE",
        );
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: purchasePrice,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: purchasePrice,
          description: `Package purchase: ${pkg.name}`,
          reference: `PUR-${randomUUID()}`,
        },
      });

      const purchase = await tx.packagePurchase.create({
        data: {
          userId,
          packageId: pkg.id,
          purchasePrice,
          expectedProfit,
          status: PurchaseStatus.ACTIVE,
          sellingWindowStart,
          sellingWindowEnd,
          completionPercent: 0,
        },
        include: {
          package: {
            include: {
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      await tx.productSalesRecord.createMany({
        data: pkg.products.map((product) => ({
          purchaseId: purchase.id,
          productId: product.id,
          totalQuantity: product.quantity,
          soldQuantity: 0,
        })),
      });

      return purchase;
    });
  },

  async getActivePurchases(userId: string) {
    return prisma.packagePurchase.findMany({
      where: {
        userId,
        status: PurchaseStatus.ACTIVE,
      },
      include: {
        package: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPurchaseProgress(id: string) {
    const purchase = await ensurePurchaseExists(id);
    const metrics = calculateCompletion(purchase.salesRecords);
    const roundedCompletion = Number(metrics.completionPercent.toFixed(2));

    if (purchase.completionPercent !== roundedCompletion) {
      await prisma.packagePurchase.update({
        where: { id: purchase.id },
        data: {
          completionPercent: roundedCompletion,
        },
      });
    }

    return {
      purchaseId: purchase.id,
      status: purchase.status,
      sellingWindowStart: purchase.sellingWindowStart,
      sellingWindowEnd: purchase.sellingWindowEnd,
      totalQuantity: metrics.totalQuantity,
      soldQuantity: metrics.soldQuantity,
      completionPercent: roundedCompletion,
      products: purchase.salesRecords.map((record) => ({
        productId: record.productId,
        productName: record.product.name,
        totalQuantity: record.totalQuantity,
        soldQuantity: record.soldQuantity,
        completionPercent:
          record.totalQuantity > 0
            ? Number(((record.soldQuantity / record.totalQuantity) * 100).toFixed(2))
            : 0,
      })),
    };
  },

  async getAllPurchases(filters: PurchaseQueryInput) {
    const { page, limit, status, userId, packageId, activeOnly } = filters;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.PackagePurchaseWhereInput = {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
      ...(packageId ? { packageId } : {}),
      ...(activeOnly
        ? {
            status: PurchaseStatus.ACTIVE,
            sellingWindowEnd: { gt: now },
          }
        : {}),
    };

    const [total, purchases] = await prisma.$transaction([
      prisma.packagePurchase.count({ where }),
      prisma.packagePurchase.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          package: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      purchases,
    };
  },
};
