import { PurchaseStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { settlementService } from "@/lib/services/settlement.service";

describe("settlementService", () => {
  it("calculates settled payout when completion reaches threshold", () => {
    const result = settlementService.calculatePayout({
      id: "purchase-1",
      userId: "user-1",
      purchasePrice: 1000,
      expectedProfit: 500,
      status: PurchaseStatus.ACTIVE,
      sellingWindowEnd: new Date(),
      completionPercent: 80,
    });

    expect(result.status).toBe(PurchaseStatus.SETTLED);
    expect(result.payout).toBe(1450);
    expect(result.commission).toBe(50);
  });
});
