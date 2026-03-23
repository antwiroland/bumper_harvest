import { beforeEach, describe, expect, it, vi } from "vitest";

const { createPurchase, requireUser } = vi.hoisted(() => ({
  createPurchase: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("@/lib/auth-utils", () => ({
  requireUser,
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/services/purchase.service", () => ({
  purchaseService: {
    createPurchase,
    getAllPurchases: vi.fn(),
  },
  PurchaseServiceError: class PurchaseServiceError extends Error {
    code: "NOT_FOUND" | "BAD_REQUEST" | "INSUFFICIENT_BALANCE" | "SUBSCRIPTION_REQUIRED" =
      "BAD_REQUEST";
  },
}));

import { POST } from "@/app/api/purchases/route";

describe("POST /api/purchases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a purchase for authenticated users", async () => {
    requireUser.mockResolvedValue({ id: "user-1", role: "USER" });
    createPurchase.mockResolvedValue({ id: "purchase-1" });

    const request = new Request("http://localhost/api/purchases", {
      method: "POST",
      body: JSON.stringify({ packageId: "507f1f77bcf86cd799439011" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.purchase.id).toBe("purchase-1");
  });
});
