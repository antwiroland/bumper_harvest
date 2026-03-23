import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { analyticsService } from "@/lib/services/analytics.service";

describe("analyticsService", () => {
  it("returns top performing packages sorted by volume", async () => {
    vi.spyOn(prisma.packagePurchase, "findMany").mockResolvedValue([
      {
        packageId: "pkg-1",
        purchasePrice: 300,
        expectedProfit: 50,
        completionPercent: 70,
        package: { name: "A", category: { name: "CatA" } },
      },
      {
        packageId: "pkg-2",
        purchasePrice: 500,
        expectedProfit: 100,
        completionPercent: 80,
        package: { name: "B", category: { name: "CatB" } },
      },
    ] as never);

    const result = await analyticsService.getTopPerformingPackages(2);
    expect(result[0]?.packageId).toBe("pkg-2");
  });
});
