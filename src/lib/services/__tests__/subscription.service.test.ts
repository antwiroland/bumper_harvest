import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { subscriptionService } from "@/lib/services/subscription.service";

describe("subscriptionService", () => {
  it("returns false when subscription does not exist", async () => {
    vi.spyOn(prisma.subscription, "findUnique").mockResolvedValue(null);
    const result = await subscriptionService.hasActiveSubscription("user-1", "cat-1");
    expect(result).toBe(false);
  });
});
