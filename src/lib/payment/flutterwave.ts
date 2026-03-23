export type FlutterwaveInitializationResult = {
  authorizationUrl: string;
  reference: string;
  raw: unknown;
};

export type FlutterwaveVerificationResult = {
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
  reference: string;
  paidAt: Date | null;
  metadata?: unknown;
  raw: unknown;
};

type FlutterwaveInitializeResponse = {
  status: string;
  message?: string;
  data?: {
    link?: string;
  };
};

type FlutterwaveVerifyResponse = {
  status: string;
  message?: string;
  data?: {
    status?: string;
    amount?: number;
    tx_ref?: string;
    meta?: unknown;
    created_at?: string;
  };
};

const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL ?? "https://api.flutterwave.com/v3";

function getFlutterwaveSecretKey() {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  }
  return secret;
}

async function flutterwaveRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${FLUTTERWAVE_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    const message =
      typeof payload.message === "string" ? payload.message : "Flutterwave request failed";
    throw new Error(message);
  }

  return payload;
}

function mapFlutterwaveStatus(status: string | undefined): "SUCCESS" | "FAILED" | "PENDING" {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "successful") {
    return "SUCCESS";
  }
  if (["failed", "cancelled"].includes(normalized)) {
    return "FAILED";
  }
  return "PENDING";
}

export const flutterwaveProvider = {
  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FlutterwaveInitializationResult> {
    const payload = await flutterwaveRequest<FlutterwaveInitializeResponse>("/payments", {
      method: "POST",
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amount,
        currency: "NGN",
        redirect_url: params.callbackUrl,
        customer: {
          email: params.email,
        },
        meta: params.metadata,
      }),
    });

    if (payload.status !== "success" || !payload.data?.link) {
      throw new Error(payload.message ?? "Unable to initialize Flutterwave transaction");
    }

    return {
      authorizationUrl: payload.data.link,
      reference: params.reference,
      raw: payload,
    };
  },

  async verifyTransaction(reference: string): Promise<FlutterwaveVerificationResult> {
    const payload = await flutterwaveRequest<FlutterwaveVerifyResponse>(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      {
        method: "GET",
      },
    );

    if (payload.status !== "success" || !payload.data?.tx_ref) {
      throw new Error(payload.message ?? "Unable to verify Flutterwave transaction");
    }

    return {
      status: mapFlutterwaveStatus(payload.data.status),
      amount: typeof payload.data.amount === "number" ? payload.data.amount : 0,
      reference: payload.data.tx_ref,
      paidAt: payload.data.created_at ? new Date(payload.data.created_at) : null,
      metadata: payload.data.meta,
      raw: payload,
    };
  },

  verifyWebhookSignature(signature: string | null): boolean {
    const configuredHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    if (!configuredHash || !signature) {
      return false;
    }
    return signature === configuredHash;
  },
};
