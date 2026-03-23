import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  it("returns 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "bad" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
