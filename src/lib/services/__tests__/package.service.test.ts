import { describe, expect, it, vi } from "vitest";

import { packageService } from "@/lib/services/package.service";

describe("packageService", () => {
  it("calculates package metrics correctly", async () => {
    const spy = vi.spyOn(packageService, "getPackageWithProducts").mockResolvedValue({
      id: "pkg-1",
      products: [
        { quantity: 2, costPrice: 100, sellingPrice: 160 },
        { quantity: 1, costPrice: 80, sellingPrice: 120 },
      ],
    } as never);

    const metrics = await packageService.calculatePackageMetrics("pkg-1");
    expect(metrics.expectedProfit).toBe(160);
    expect(metrics.totalCost).toBe(280);
    expect(metrics.totalRevenue).toBe(440);

    spy.mockRestore();
  });
});
