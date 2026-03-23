import { describe, expect, it } from "vitest";

import { productService } from "@/lib/services/product.service";

describe("productService", () => {
  it("calculates expected profit for a product", () => {
    const result = productService.calculateProductProfit({
      quantity: 10,
      costPrice: 20,
      sellingPrice: 35,
    });

    expect(result.totalCost).toBe(200);
    expect(result.totalRevenue).toBe(350);
    expect(result.expectedProfit).toBe(150);
  });
});
