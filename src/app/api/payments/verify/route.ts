import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { PaymentServiceError, paymentService } from "@/lib/services/payment.service";
import { verifyPaymentSchema } from "@/lib/validations/payment";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await paymentService.verifyPayment(parsed.data.reference, user.id);
    return NextResponse.json({
      message: "Payment verification complete",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof PaymentServiceError) {
      const statusMap: Record<PaymentServiceError["code"], number> = {
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        PROVIDER_ERROR: 502,
      };
      return NextResponse.json({ error: error.message }, { status: statusMap[error.code] });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
