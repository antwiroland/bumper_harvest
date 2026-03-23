import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { subscriptionService, SubscriptionServiceError } from "@/lib/services/subscription.service";
import { checkSubscriptionSchema } from "@/lib/validations/subscription";

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const parsed = checkSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const requestedUserId = parsed.data.userId;
    const targetUserId =
      requestedUserId && currentUser.role === "ADMIN" ? requestedUserId : currentUser.id;

    const result = await subscriptionService.checkSubscriptionValidity(
      targetUserId,
      parsed.data.categoryId,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof SubscriptionServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
