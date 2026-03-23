import { randomUUID } from "node:crypto";

import { Prisma, Role } from "@prisma/client";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { UserListQueryInput } from "@/lib/validations/user";

export class UserServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}

async function ensureUserExists(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new UserServiceError("User not found", "NOT_FOUND");
  }

  return user;
}

export const userService = {
  async getAllUsers(filters: UserListQueryInput) {
    const { page, limit, role, search } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [{ email: { contains: search } }, { name: { contains: search } }],
          }
        : {}),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subscriptions: true,
              purchases: true,
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
      users,
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        subscriptions: {
          include: {
            category: true,
          },
          orderBy: { createdAt: "desc" },
        },
        purchases: {
          include: {
            package: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new UserServiceError("User not found", "NOT_FOUND");
    }

    return user;
  },

  async updateUserRole(id: string, role: Role) {
    const user = await ensureUserExists(id);
    if (user.role === role) {
      return user;
    }

    return prisma.user.update({
      where: { id },
      data: { role },
    });
  },

  async suspendUser(id: string) {
    const user = await ensureUserExists(id);
    if (user.role === "ADMIN") {
      throw new UserServiceError("Admin accounts cannot be suspended", "BAD_REQUEST");
    }

    const suspendedPassword = await hashPassword(`suspended-${randomUUID()}`);

    return prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });

      return tx.user.update({
        where: { id },
        data: {
          password: suspendedPassword,
        },
      });
    });
  },

  async getUserStats(id: string) {
    const user = await ensureUserExists(id);
    const [wallet, subscriptions, purchases, payments] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: id } }),
      prisma.subscription.findMany({ where: { userId: id } }),
      prisma.packagePurchase.findMany({ where: { userId: id } }),
      prisma.paymentTransaction.findMany({ where: { userId: id } }),
    ]);

    const totalPurchases = purchases.length;
    const activePurchases = purchases.filter((item) => item.status === "ACTIVE").length;
    const settledPurchases = purchases.filter((item) => item.status === "SETTLED").length;
    const refundedPurchases = purchases.filter((item) => item.status === "REFUNDED").length;
    const totalInvested = purchases.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalPayout = purchases.reduce((sum, item) => sum + (item.payoutAmount ?? 0), 0);
    const totalExpectedProfit = purchases.reduce((sum, item) => sum + item.expectedProfit, 0);
    const successfulPayments = payments.filter((item) => item.status === "SUCCESS");

    return {
      userId: user.id,
      walletBalance: wallet?.balance ?? 0,
      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter((item) => item.status === "ACTIVE").length,
      },
      purchases: {
        total: totalPurchases,
        active: activePurchases,
        settled: settledPurchases,
        refunded: refundedPurchases,
      },
      finance: {
        totalInvested: Number(totalInvested.toFixed(2)),
        totalPayout: Number(totalPayout.toFixed(2)),
        totalExpectedProfit: Number(totalExpectedProfit.toFixed(2)),
      },
      payments: {
        total: payments.length,
        successful: successfulPayments.length,
        successfulAmount: Number(
          successfulPayments.reduce((sum, item) => sum + item.amount, 0).toFixed(2),
        ),
      },
    };
  },
};
