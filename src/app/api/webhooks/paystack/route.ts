import { NextResponse } from "next/server";

import { paystackProvider } from "@/lib/payment/paystack";
import { PaymentServiceError, paymentService } from "@/lib/services/payment.service";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!paystackProvider.verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const result = await paymentService.handleWebhook(payload);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
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
