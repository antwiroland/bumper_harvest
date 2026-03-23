import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { sanitizeInput } from "@/lib/security/sanitize-input";
import { salesService, SalesServiceError } from "@/lib/services/sales.service";
import { bulkUpdateSalesSchema, salesIdSchema } from "@/lib/validations/sales";

type RouteContext = {
  params: Promise<{ purchaseId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { purchaseId } = await context.params;
    const parsedId = salesIdSchema.safeParse(purchaseId);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid purchase id" }, { status: 400 });
    }

    const records = await salesService.getSalesRecords(parsedId.data);
    const completion = await salesService.calculateCompletion(parsedId.data);
    const isWithinSellingWindow = await salesService.isWithinSellingWindow(parsedId.data);

    return NextResponse.json({
      purchaseId: parsedId.data,
      isWithinSellingWindow,
      records,
      completion,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof SalesServiceError) {
      const statusMap: Record<SalesServiceError["code"], number> = {
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        WINDOW_CLOSED: 422,
      };
      return NextResponse.json({ error: error.message }, { status: statusMap[error.code] });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { purchaseId } = await context.params;
    const parsedId = salesIdSchema.safeParse(purchaseId);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid purchase id" }, { status: 400 });
    }

    const body = sanitizeInput(await request.json());
    const parsedBody = bulkUpdateSalesSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const updates = [];
    for (const item of parsedBody.data.updates) {
      const updateResult = await salesService.updateSalesProgress(
        parsedId.data,
        item.productId,
        item.soldQuantity,
      );
      updates.push(updateResult);
    }

    const completion = await salesService.calculateCompletion(parsedId.data);
    return NextResponse.json({
      purchaseId: parsedId.data,
      updates,
      completion,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof SalesServiceError) {
      const statusMap: Record<SalesServiceError["code"], number> = {
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        WINDOW_CLOSED: 422,
      };
      return NextResponse.json({ error: error.message }, { status: statusMap[error.code] });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
