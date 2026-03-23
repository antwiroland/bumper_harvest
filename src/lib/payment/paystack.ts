import { createHmac, timingSafeEqual } from "node:crypto";

type PaystackInitializeResponse = {
  status: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message?: string;
  data?: {
    status?: string;
    amount?: number;
    reference?: string;
    paid_at?: string | null;
    metadata?: unknown;
  };
};

export type ProviderInitializationResult = {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
  raw: unknown;
};

export type ProviderVerificationResult = {
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
  reference: string;
  paidAt: Date | null;
  metadata?: unknown;
  raw: unknown;
};

const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL ?? "https://api.paystack.co";

function getPaystackSecretKey() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return secret;
}

async function paystackRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    const message =
      typeof payload.message === "string" ? payload.message : "Paystack request failed";
    throw new Error(message);
  }

  return payload;
}

function mapPaystackStatus(status: string | undefined): "SUCCESS" | "FAILED" | "PENDING" {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "success") {
    return "SUCCESS";
  }
  if (["failed", "abandoned", "reversed"].includes(normalized)) {
    return "FAILED";
  }
  return "PENDING";
}

export const paystackProvider = {
  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ProviderInitializationResult> {
    const payload = await paystackRequest<PaystackInitializeResponse>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amount * 100),
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    if (!payload.status || !payload.data?.authorization_url || !payload.data.reference) {
      throw new Error(payload.message ?? "Unable to initialize Paystack transaction");
    }

    return {
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code,
      reference: payload.data.reference,
      raw: payload,
    };
  },

  async verifyTransaction(reference: string): Promise<ProviderVerificationResult> {
    const payload = await paystackRequest<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
      },
    );

    if (!payload.status || !payload.data?.reference) {
      throw new Error(payload.message ?? "Unable to verify Paystack transaction");
    }

    return {
      status: mapPaystackStatus(payload.data.status),
      amount: typeof payload.data.amount === "number" ? payload.data.amount / 100 : 0,
      reference: payload.data.reference,
      paidAt: payload.data.paid_at ? new Date(payload.data.paid_at) : null,
      metadata: payload.data.metadata,
      raw: payload,
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) {
      return false;
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return false;
    }

    const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  },
};
