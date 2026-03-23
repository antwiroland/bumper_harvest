import { Prisma, TransactionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import type { TransactionQueryInput } from "@/lib/validations/wallet";

type WalletTransactionResult = {
  wallet: {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
  };
  transaction: {
    id: string;
    walletId: string;
    type: TransactionType;
    amount: number;
    description: string;
    reference: string | null;
    createdAt: Date;
  };
};

export class WalletServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "INSUFFICIENT_BALANCE" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "WalletServiceError";
  }
}

function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new WalletServiceError("Amount must be a positive number", "BAD_REQUEST");
  }
}

async function getWalletOrThrow(userId: string, tx: Prisma.TransactionClient = prisma) {
  const queryWallet = () =>
    tx.wallet.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  const wallet = tx === prisma ? await withPrismaRetry(queryWallet) : await queryWallet();

  if (!wallet) {
    throw new WalletServiceError("Wallet not found for user", "NOT_FOUND");
  }

  return wallet;
}

export const walletService = {
  async getWallet(userId: string) {
    return getWalletOrThrow(userId);
  },

  async getBalance(userId: string): Promise<number> {
    const wallet = await getWalletOrThrow(userId);
    return wallet.balance;
  },

  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    validateAmount(amount);
    const wallet = await getWalletOrThrow(userId);
    return wallet.balance >= amount;
  },

  async credit(
    userId: string,
    amount: number,
    description: string,
    reference?: string,
  ): Promise<WalletTransactionResult> {
    validateAmount(amount);

    return prisma.$transaction(async (tx) => {
      const wallet = await getWalletOrThrow(userId, tx);
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount,
          description,
          reference: reference ?? null,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });
  },

  async debit(
    userId: string,
    amount: number,
    description: string,
    reference?: string,
  ): Promise<WalletTransactionResult> {
    validateAmount(amount);

    return prisma.$transaction(async (tx) => {
      const wallet = await getWalletOrThrow(userId, tx);
      if (wallet.balance < amount) {
        throw new WalletServiceError("Insufficient wallet balance", "INSUFFICIENT_BALANCE");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount,
          description,
          reference: reference ?? null,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });
  },

  async getTransactions(userId: string, pagination: TransactionQueryInput) {
    const wallet = await getWalletOrThrow(userId);
    const { page, limit, type } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {
      walletId: wallet.id,
      ...(type ? { type } : {}),
    };

    const [total, transactions] = await withPrismaRetry(() =>
      prisma.$transaction([
        prisma.walletTransaction.count({ where }),
        prisma.walletTransaction.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]),
    );

    return {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      transactions,
    };
  },
};
