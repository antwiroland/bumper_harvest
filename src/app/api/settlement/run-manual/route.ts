import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { auditLog } from "@/lib/security/audit-log";
import { settlementService, SettlementServiceError } from "@/lib/services/settlement.service";

export async function POST() {
  try {
    const admin = await requireAdmin();
    const result = await settlementService.processSettlements();
    auditLog("admin.settlement.run_manual", {
      adminId: admin.id,
      processed: result.processed,
      failed: result.failed,
    });
    return NextResponse.json({
      message: "Manual settlement run completed",
      ...result,
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
