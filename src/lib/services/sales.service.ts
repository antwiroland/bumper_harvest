import { PurchaseStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class SalesServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST" | "WINDOW_CLOSED",
  ) {
    super(message);
    this.name = "SalesServiceError";
  }
}

async function getPurchaseOrThrow(purchaseId: string, tx: Prisma.TransactionClient = prisma) {
  const purchase = await tx.packagePurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase) {
    throw new SalesServiceError("Purchase not found", "NOT_FOUND");
  }
  return purchase;
}

async function assertWindowOpen(purchaseId: string, tx: Prisma.TransactionClient = prisma) {
  const purchase = await getPurchaseOrThrow(purchaseId, tx);
  const now = new Date();
  if (purchase.status !== PurchaseStatus.ACTIVE || now > purchase.sellingWindowEnd) {
    throw new SalesServiceError("Selling window has closed", "WINDOW_CLOSED");
  }
  return purchase;
}

export const salesService = {
  async getSalesRecords(purchaseId: string) {
    await getPurchaseOrThrow(purchaseId);
    return prisma.productSalesRecord.findMany({
      where: { purchaseId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async calculateCompletion(purchaseId: string) {
    const records = await this.getSalesRecords(purchaseId);
    const totalQuantity = records.reduce((sum, record) => sum + record.totalQuantity, 0);
    const soldQuantity = records.reduce((sum, record) => sum + record.soldQuantity, 0);
    const completionPercent = totalQuantity > 0 ? (soldQuantity / totalQuantity) * 100 : 0;
    const roundedCompletion = Number(completionPercent.toFixed(2));

    await prisma.packagePurchase.update({
      where: { id: purchaseId },
      data: { completionPercent: roundedCompletion },
    });

    return {
      purchaseId,
      totalQuantity,
      soldQuantity,
      completionPercent: roundedCompletion,
    };
  },

  async isWithinSellingWindow(purchaseId: string) {
    const purchase = await getPurchaseOrThrow(purchaseId);
    const now = new Date();
    return purchase.status === PurchaseStatus.ACTIVE && now <= purchase.sellingWindowEnd;
  },

  async updateSalesProgress(purchaseId: string, productId: string, soldQty: number) {
    if (soldQty < 0) {
      throw new SalesServiceError("Sold quantity cannot be negative", "BAD_REQUEST");
    }

    return prisma.$transaction(async (tx) => {
      await assertWindowOpen(purchaseId, tx);
      const salesRecord = await tx.productSalesRecord.findUnique({
        where: {
          purchaseId_productId: {
            purchaseId,
            productId,
          },
        },
      });

      if (!salesRecord) {
        throw new SalesServiceError("Sales record not found", "NOT_FOUND");
      }

      if (soldQty > salesRecord.totalQuantity) {
        throw new SalesServiceError(
          "Sold quantity cannot exceed total product quantity",
          "BAD_REQUEST",
        );
      }

      const updatedRecord = await tx.productSalesRecord.update({
        where: {
          purchaseId_productId: {
            purchaseId,
            productId,
          },
        },
        data: {
          soldQuantity: soldQty,
        },
        include: {
          product: true,
        },
      });

      const allRecords = await tx.productSalesRecord.findMany({
        where: { purchaseId },
      });
      const totalQuantity = allRecords.reduce((sum, item) => sum + item.totalQuantity, 0);
      const totalSold = allRecords.reduce((sum, item) => sum + item.soldQuantity, 0);
      const completionPercent = totalQuantity > 0 ? (totalSold / totalQuantity) * 100 : 0;
      const roundedCompletion = Number(completionPercent.toFixed(2));

      await tx.packagePurchase.update({
        where: { id: purchaseId },
        data: { completionPercent: roundedCompletion },
      });

      return {
        salesRecord: updatedRecord,
        completion: {
          purchaseId,
          totalQuantity,
          soldQuantity: totalSold,
          completionPercent: roundedCompletion,
        },
      };
    });
  },

  async getExpiredActivePurchases() {
    const now = new Date();
    return prisma.packagePurchase.findMany({
      where: {
        status: PurchaseStatus.ACTIVE,
        sellingWindowEnd: {
          lte: now,
        },
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
      orderBy: { sellingWindowEnd: "asc" },
    });
  },
};
