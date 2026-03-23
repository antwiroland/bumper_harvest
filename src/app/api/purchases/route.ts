import { NextResponse } from "next/server";

import { requireAuth, requireUser } from "@/lib/auth-utils";
import { logger } from "@/lib/errors/logger";
import { purchaseService, PurchaseServiceError } from "@/lib/services/purchase.service";
import { createPurchaseSchema, purchaseQuerySchema } from "@/lib/validations/purchase";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const url = new URL(request.url);
    const parsed = purchaseQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      userId: url.searchParams.get("userId") ?? undefined,
      packageId: url.searchParams.get("packageId") ?? undefined,
      activeOnly: url.searchParams.get("activeOnly") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const filters = {
      ...parsed.data,
      userId: currentUser.role === "ADMIN" ? parsed.data.userId : currentUser.id,
    };

    const purchases = await purchaseService.getAllPurchases(filters);
    return NextResponse.json(purchases);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = createPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const purchase = await purchaseService.createPurchase(user.id, parsed.data.packageId);
    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof PurchaseServiceError) {
      const statusMap: Record<PurchaseServiceError["code"], number> = {
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        INSUFFICIENT_BALANCE: 422,
        SUBSCRIPTION_REQUIRED: 403,
      };
      return NextResponse.json({ error: error.message }, { status: statusMap[error.code] });
    }
    logger.error("Unhandled POST /api/purchases error", {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
