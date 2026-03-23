import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { salesService, SalesServiceError } from "@/lib/services/sales.service";
import { salesQuerySchema } from "@/lib/validations/sales";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = salesQuerySchema.safeParse({
      purchaseId: url.searchParams.get("purchaseId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!parsed.data.purchaseId) {
      const expiredActivePurchases = await salesService.getExpiredActivePurchases();
      return NextResponse.json({ expiredActivePurchases });
    }

    const records = await salesService.getSalesRecords(parsed.data.purchaseId);
    const completion = await salesService.calculateCompletion(parsed.data.purchaseId);
    return NextResponse.json({ records, completion });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof SalesServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
