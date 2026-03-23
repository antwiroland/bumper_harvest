import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { auditLog } from "@/lib/security/audit-log";
import { settlementService, SettlementServiceError } from "@/lib/services/settlement.service";
import { purchaseIdSchema } from "@/lib/validations/purchase";

type RouteContext = {
  params: Promise<{ purchaseId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { purchaseId } = await context.params;
    const parsedId = purchaseIdSchema.safeParse(purchaseId);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid purchase id" }, { status: 400 });
    }

    const result = await settlementService.settlePurchase(parsedId.data);
    auditLog("admin.settlement.single_processed", {
      adminId: admin.id,
      purchaseId: parsedId.data,
    });
    return NextResponse.json({
      message: "Purchase settlement processed",
      result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof SettlementServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
