import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { purchaseService, PurchaseServiceError } from "@/lib/services/purchase.service";
import { purchaseIdSchema } from "@/lib/validations/purchase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireAuth();
    const { id } = await context.params;
    const parsedId = purchaseIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid purchase id" }, { status: 400 });
    }

    const purchase = await purchaseService.getPurchaseById(parsedId.data);
    if (currentUser.role !== "ADMIN" && purchase.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const progress = await purchaseService.getPurchaseProgress(parsedId.data);
    return NextResponse.json({ purchase, progress });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof PurchaseServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
