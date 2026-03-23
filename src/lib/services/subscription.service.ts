import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class SubscriptionServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "SubscriptionServiceError";
  }
}

async function ensureCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new SubscriptionServiceError("Category not found", "BAD_REQUEST");
  }
  return category;
}

async function ensureSubscriptionExists(id: string) {
  const item = await prisma.subscription.findUnique({
    where: { id },
  });
  if (!item) {
    throw new SubscriptionServiceError("Subscription not found", "NOT_FOUND");
  }
  return item;
}

function isCurrentlyValid(status: SubscriptionStatus, endDate: Date | null): boolean {
  if (status !== SubscriptionStatus.ACTIVE) {
    return false;
  }
  if (!endDate) {
    return true;
  }
  return endDate.getTime() > Date.now();
}

export const subscriptionService = {
  async getUserSubscriptions(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getSubscriptionById(id: string) {
    const item = await prisma.subscription.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    if (!item) {
      throw new SubscriptionServiceError("Subscription not found", "NOT_FOUND");
    }
    return item;
  },

  async hasActiveSubscription(userId: string, categoryId: string): Promise<boolean> {
    const item = await prisma.subscription.findFirst({
      where: { userId, categoryId },
      orderBy: { createdAt: "desc" },
      select: {
        status: true,
        endDate: true,
      },
    });

    if (!item) {
      return false;
    }

    return isCurrentlyValid(item.status, item.endDate);
  },

  async createSubscription(userId: string, categoryId: string) {
    await ensureCategoryExists(categoryId);

    return prisma.subscription.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      update: {
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: null,
      },
      create: {
        userId,
        categoryId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        category: true,
      },
    });
  },

  async cancelSubscription(id: string) {
    await ensureSubscriptionExists(id);
    return prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        endDate: new Date(),
      },
      include: {
        category: true,
      },
    });
  },

  async getSubscriptionsByCategory(categoryId: string) {
    await ensureCategoryExists(categoryId);
    return prisma.subscription.findMany({
      where: { categoryId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async checkSubscriptionValidity(userId: string, categoryId: string) {
    const hasActive = await this.hasActiveSubscription(userId, categoryId);
    return {
      userId,
      categoryId,
      hasAccess: hasActive,
    };
  },
};
