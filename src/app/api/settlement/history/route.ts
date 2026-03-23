import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-utils";
import { settlementService } from "@/lib/services/settlement.service";

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  purchaseId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid purchase id")
    .optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = historyQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      purchaseId: url.searchParams.get("purchaseId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const history = await settlementService.getSettlementHistory(parsed.data);
    return NextResponse.json(history);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
