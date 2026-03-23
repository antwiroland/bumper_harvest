import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { PaymentServiceError, paymentService } from "@/lib/services/payment.service";

describe("paymentService", () => {
  it("throws not found when verifying unknown reference", async () => {
    vi.spyOn(prisma.paymentTransaction, "findUnique").mockResolvedValue(null);

    await expect(paymentService.verifyPayment("ref-unknown")).rejects.toEqual(
      expect.objectContaining<Partial<PaymentServiceError>>({
        code: "NOT_FOUND",
      }),
    );
  });
});
