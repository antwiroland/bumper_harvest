import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { subscriptionService, SubscriptionServiceError } from "@/lib/services/subscription.service";
import { subscribeSchema } from "@/lib/validations/subscription";

export async function GET() {
  try {
    const user = await requireAuth();
    const subscriptions = await subscriptionService.getUserSubscriptions(user.id);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const subscription = await subscriptionService.createSubscription(
      user.id,
      parsed.data.categoryId,
    );

    return NextResponse.json({ subscription }, { status: 201 });
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
