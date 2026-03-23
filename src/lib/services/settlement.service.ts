import { randomUUID } from "node:crypto";

import { PurchaseStatus, TransactionType, type Prisma } from "@prisma/client";

import { SETTLEMENT_SUCCESS_THRESHOLD } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { purchaseService } from "@/lib/services/purchase.service";
import { salesService } from "@/lib/services/sales.service";

export class SettlementServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "SettlementServiceError";
  }
}

type PurchaseForSettlement = {
  id: string;
  userId: string;
  purchasePrice: number;
  expectedProfit: number;
  status: PurchaseStatus;
  sellingWindowEnd: Date;
  completionPercent: number;
};

type SettlementHistoryFilters = {
  page?: number;
  limit?: number;
  purchaseId?: string;
};

function calculatePayoutFromPurchase(purchase: PurchaseForSettlement) {
  const isSuccess = purchase.completionPercent >= SETTLEMENT_SUCCESS_THRESHOLD;
  const baseProfit = Math.max(0, purchase.expectedProfit);
  const commission = isSuccess ? baseProfit * 0.1 : 0;
  const payout = isSuccess
    ? purchase.purchasePrice + baseProfit - commission
    : purchase.purchasePrice;
  const status = isSuccess ? PurchaseStatus.SETTLED : PurchaseStatus.REFUNDED;

  return {
    status,
    payout: Number(payout.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    completionPct: Number(purchase.completionPercent.toFixed(2)),
  };
}

async function getPurchaseOrThrow(purchaseId: string, tx: Prisma.TransactionClient = prisma) {
  const purchase = await tx.packagePurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) {
    throw new SettlementServiceError("Purchase not found", "NOT_FOUND");
  }

  return purchase;
}

export const settlementService = {
  calculatePayout(purchase: PurchaseForSettlement) {
    return calculatePayoutFromPurchase(purchase);
  },

  async settlePurchase(purchaseId: string) {
    const progress = await purchaseService.getPurchaseProgress(purchaseId);

    return prisma.$transaction(async (tx) => {
      const purchase = await getPurchaseOrThrow(purchaseId, tx);

      if (purchase.status !== PurchaseStatus.ACTIVE) {
        return {
          purchaseId: purchase.id,
          alreadySettled: true,
          status: purchase.status,
          payoutAmount: purchase.payoutAmount,
        };
      }

      const now = new Date();
      if (now < purchase.sellingWindowEnd) {
        throw new SettlementServiceError(
          "Purchase selling window has not expired yet",
          "BAD_REQUEST",
        );
      }

      const payoutResult = calculatePayoutFromPurchase({
        id: purchase.id,
        userId: purchase.userId,
        purchasePrice: purchase.purchasePrice,
        expectedProfit: purchase.expectedProfit,
        status: purchase.status,
        sellingWindowEnd: purchase.sellingWindowEnd,
        completionPercent: progress.completionPercent,
      });

      const wallet = await tx.wallet.findUnique({
        where: { userId: purchase.userId },
      });
      if (!wallet) {
        throw new SettlementServiceError("Wallet not found for purchase user", "BAD_REQUEST");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: payoutResult.payout,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount: payoutResult.payout,
          description: `Settlement payout for purchase ${purchase.id}`,
          reference: `SET-${randomUUID()}`,
        },
      });

      const updatedPurchase = await tx.packagePurchase.update({
        where: { id: purchase.id },
        data: {
          status: payoutResult.status,
          completionPercent: payoutResult.completionPct,
          settledAt: now,
          payoutAmount: payoutResult.payout,
        },
      });

      const log = await tx.settlementLog.create({
        data: {
          purchaseId: purchase.id,
          status: payoutResult.status,
          payout: payoutResult.payout,
          commission: payoutResult.commission,
          completionPct: payoutResult.completionPct,
          processedAt: now,
        },
      });

      return {
        purchase: updatedPurchase,
        settlement: log,
      };
    });
  },

  async processSettlements() {
    const expiredActivePurchases = await salesService.getExpiredActivePurchases();
    const results = [];

    for (const purchase of expiredActivePurchases) {
      try {
        const result = await this.settlePurchase(purchase.id);
        results.push({
          purchaseId: purchase.id,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          purchaseId: purchase.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      totalExpired: expiredActivePurchases.length,
      processed: results.filter((item) => item.success).length,
      failed: results.filter((item) => !item.success).length,
      results,
    };
  },

  async getSettlementHistory(filters: SettlementHistoryFilters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SettlementLogWhereInput = {
      ...(filters.purchaseId ? { purchaseId: filters.purchaseId } : {}),
    };

    const [total, settlements] = await prisma.$transaction([
      prisma.settlementLog.count({ where }),
      prisma.settlementLog.findMany({
        where,
        orderBy: { processedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      settlements,
    };
  },
};
