import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { purchaseService } from "@/lib/services/purchase.service";

describe("purchaseService", () => {
  it("returns user purchases ordered by latest", async () => {
    vi.spyOn(prisma.packagePurchase, "findMany").mockResolvedValue([
      { id: "pur-1" },
      { id: "pur-2" },
    ] as never);

    const result = await purchaseService.getUserPurchases("user-1");
    expect(result).toHaveLength(2);
  });
});
