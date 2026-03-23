import { NextResponse } from "next/server";

import { settlementService, SettlementServiceError } from "@/lib/services/settlement.service";

function hasValidCronSecret(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    return false;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret =
    authHeader && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  return headerSecret === configuredSecret || bearerSecret === configuredSecret;
}

export async function POST(request: Request) {
  try {
    if (!process.env.CRON_SECRET) {
      return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
    }

    if (!hasValidCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const result = await settlementService.processSettlements();
    return NextResponse.json({
      message: "Settlement job completed",
      ...result,
    });
  } catch (error) {
    if (error instanceof SettlementServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
