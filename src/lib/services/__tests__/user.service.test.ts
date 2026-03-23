import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { userService } from "@/lib/services/user.service";

describe("userService", () => {
  it("returns paginated user list", async () => {
    vi.spyOn(prisma, "$transaction").mockResolvedValueOnce([
      1,
      [{ id: "user-1", name: "Test User" }],
    ] as never);

    const result = await userService.getAllUsers({
      page: 1,
      limit: 20,
    });

    expect(result.total).toBe(1);
    expect(result.users).toHaveLength(1);
  });
});
