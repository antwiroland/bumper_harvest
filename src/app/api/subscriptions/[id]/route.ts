import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { subscriptionService, SubscriptionServiceError } from "@/lib/services/subscription.service";
import { subscriptionIdSchema } from "@/lib/validations/subscription";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const parsedId = subscriptionIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
    }

    const subscription = await subscriptionService.getSubscriptionById(parsedId.data);
    if (user.role !== "ADMIN" && subscription.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof SubscriptionServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const parsedId = subscriptionIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
    }

    const current = await subscriptionService.getSubscriptionById(parsedId.data);
    if (user.role !== "ADMIN" && current.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscription = await subscriptionService.cancelSubscription(parsedId.data);
    return NextResponse.json({ message: "Subscription cancelled", subscription });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof SubscriptionServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
