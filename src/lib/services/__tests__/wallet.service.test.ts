import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { walletService } from "@/lib/services/wallet.service";

describe("walletService", () => {
  it("returns wallet balance", async () => {
    vi.spyOn(prisma.wallet, "findUnique").mockResolvedValue({
      id: "wallet-1",
      userId: "user-1",
      balance: 1250,
    } as never);

    const result = await walletService.getBalance("user-1");
    expect(result).toBe(1250);
  });
});
