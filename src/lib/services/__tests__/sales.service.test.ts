import { describe, expect, it } from "vitest";

import { SalesServiceError, salesService } from "@/lib/services/sales.service";

describe("salesService", () => {
  it("rejects negative sold quantity", async () => {
    await expect(
      salesService.updateSalesProgress("purchase-1", "product-1", -1),
    ).rejects.toBeInstanceOf(SalesServiceError);
  });
});
