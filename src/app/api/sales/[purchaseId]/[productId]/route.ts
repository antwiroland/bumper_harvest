import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { salesService, SalesServiceError } from "@/lib/services/sales.service";
import { salesIdSchema, updateSalesSchema } from "@/lib/validations/sales";

type RouteContext = {
  params: Promise<{ purchaseId: string; productId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { purchaseId, productId } = await context.params;
    const parsedPurchaseId = salesIdSchema.safeParse(purchaseId);
    const parsedProductId = salesIdSchema.safeParse(productId);
    if (!parsedPurchaseId.success || !parsedProductId.success) {
      return NextResponse.json({ error: "Invalid purchase or product id" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateSalesSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const result = await salesService.updateSalesProgress(
      parsedPurchaseId.data,
      parsedProductId.data,
      parsedBody.data.soldQuantity,
    );

    return NextResponse.json(result);
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
