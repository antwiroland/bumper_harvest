import { beforeEach, describe, expect, it, vi } from "vitest";

const { processSettlements } = vi.hoisted(() => ({
  processSettlements: vi.fn(),
}));

vi.mock("@/lib/services/settlement.service", () => ({
  settlementService: {
    processSettlements,
  },
  SettlementServiceError: class SettlementServiceError extends Error {
    code: "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
  },
}));

import { POST } from "@/app/api/settlement/run/route";

describe("POST /api/settlement/run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  it("rejects invalid cron secret", async () => {
    const request = new Request("http://localhost/api/settlement/run", {
      method: "POST",
      headers: {
        "x-cron-secret": "wrong-secret",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("runs settlement job with valid cron secret", async () => {
    processSettlements.mockResolvedValue({
      totalExpired: 1,
      processed: 1,
      failed: 0,
      results: [],
    });

    const request = new Request("http://localhost/api/settlement/run", {
      method: "POST",
      headers: {
        "x-cron-secret": "test-cron-secret",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
