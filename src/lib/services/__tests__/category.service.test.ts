import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { categoryService } from "@/lib/services/category.service";

describe("categoryService", () => {
  it("returns all categories", async () => {
    vi.spyOn(prisma.category, "findMany").mockResolvedValue([
      { id: "cat-1", name: "Groceries" },
    ] as never);
    const result = await categoryService.getAllCategories();
    expect(result).toHaveLength(1);
  });
});
