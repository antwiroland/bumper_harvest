import { randomUUID } from "node:crypto";

import { PaymentStatus, PaymentType, Prisma } from "@prisma/client";

import { flutterwaveProvider } from "@/lib/payment/flutterwave";
import { paystackProvider } from "@/lib/payment/paystack";
import { prisma } from "@/lib/prisma";

type SupportedPaymentProvider = "paystack" | "flutterwave";

type ProviderInitializationResult = {
  authorizationUrl: string;
  reference: string;
  raw: unknown;
};

type ProviderVerificationResult = {
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
  reference: string;
  paidAt: Date | null;
  metadata?: unknown;
  raw: unknown;
};

export class PaymentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST" | "PROVIDER_ERROR" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

function ensurePositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaymentServiceError("Amount must be a positive number", "BAD_REQUEST");
  }
}

function resolveProvider(provider: string): SupportedPaymentProvider {
  if (provider === "paystack" || provider === "flutterwave") {
    return provider;
  }
  throw new PaymentServiceError(`Unsupported payment provider: ${provider}`, "BAD_REQUEST");
}

function generateReference(type: PaymentType) {
  const prefix = type === PaymentType.DEPOSIT ? "DEP" : "SUB";
  return `${prefix}-${randomUUID()}`;
}

function mergeMetadata(
  existing: Prisma.JsonValue | null,
  incoming: Record<string, unknown>,
): Prisma.InputJsonValue {
  const current =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};

  return toInputJsonValue({
    ...current,
    ...incoming,
  });
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function getUserEmail(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new PaymentServiceError("User not found", "NOT_FOUND");
  }

  return user.email;
}

async function initializeWithProvider(
  provider: SupportedPaymentProvider,
  params: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<ProviderInitializationResult> {
  if (provider === "flutterwave") {
    return flutterwaveProvider.initializeTransaction(params);
  }

  return paystackProvider.initializeTransaction(params);
}

async function verifyWithProvider(
  provider: SupportedPaymentProvider,
  reference: string,
): Promise<ProviderVerificationResult> {
  if (provider === "flutterwave") {
    return flutterwaveProvider.verifyTransaction(reference);
  }

  return paystackProvider.verifyTransaction(reference);
}

export const paymentService = {
  async initializePayment(
    userId: string,
    amount: number,
    type: PaymentType,
    provider: SupportedPaymentProvider = "paystack",
    metadata?: Record<string, unknown>,
    callbackUrl?: string,
  ) {
    ensurePositiveAmount(amount);
    const userEmail = await getUserEmail(userId);
    const internalReference = generateReference(type);

    let providerResponse: ProviderInitializationResult;
    try {
      providerResponse = await initializeWithProvider(provider, {
        email: userEmail,
        amount,
        reference: internalReference,
        callbackUrl,
        metadata,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment initialization failed";
      throw new PaymentServiceError(message, "PROVIDER_ERROR");
    }

    const payment = await prisma.paymentTransaction.create({
      data: {
        userId,
        type,
        amount,
        status: PaymentStatus.PENDING,
        provider,
        reference: providerResponse.reference,
        metadata: toInputJsonValue({
          userMetadata: metadata ?? {},
          providerInitialization: providerResponse.raw,
        }),
      },
    });

    return {
      payment,
      checkoutUrl: providerResponse.authorizationUrl,
      reference: providerResponse.reference,
    };
  },

  async verifyPayment(reference: string, requesterUserId?: string) {
    const payment = await prisma.paymentTransaction.findUnique({
      where: { reference },
    });

    if (!payment) {
      throw new PaymentServiceError("Payment transaction not found", "NOT_FOUND");
    }

    if (requesterUserId && payment.userId !== requesterUserId) {
      throw new PaymentServiceError("You cannot verify this payment", "FORBIDDEN");
    }

    let providerVerification: ProviderVerificationResult;
    try {
      providerVerification = await verifyWithProvider(resolveProvider(payment.provider), reference);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment verification failed";
      throw new PaymentServiceError(message, "PROVIDER_ERROR");
    }

    if (
      providerVerification.amount > 0 &&
      Math.abs(providerVerification.amount - payment.amount) > 0.01
    ) {
      throw new PaymentServiceError(
        "Provider amount does not match initialized amount",
        "BAD_REQUEST",
      );
    }

    if (providerVerification.status === "SUCCESS") {
      const updatedPayment = await prisma.$transaction(async (tx) => {
        const current = await tx.paymentTransaction.findUnique({
          where: { reference },
        });

        if (!current) {
          throw new PaymentServiceError("Payment transaction not found", "NOT_FOUND");
        }

        if (current.status === PaymentStatus.SUCCESS) {
          return current;
        }

        if (current.type === PaymentType.DEPOSIT) {
          const wallet = await tx.wallet.findUnique({
            where: { userId: current.userId },
          });

          if (!wallet) {
            throw new PaymentServiceError("Wallet not found for payment user", "BAD_REQUEST");
          }

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: current.amount } },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: "CREDIT",
              amount: current.amount,
              description: `Payment deposit (${current.provider})`,
              reference: current.reference,
            },
          });
        }

        return tx.paymentTransaction.update({
          where: { id: current.id },
          data: {
            status: PaymentStatus.SUCCESS,
            metadata: mergeMetadata(current.metadata, {
              providerVerification: providerVerification.raw,
              providerVerifiedAt: providerVerification.paidAt?.toISOString() ?? null,
            }),
          },
        });
      });

      return {
        payment: updatedPayment,
        providerStatus: providerVerification.status,
      };
    }

    if (providerVerification.status === "FAILED") {
      const updatedPayment = await prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: mergeMetadata(payment.metadata, {
            providerVerification: providerVerification.raw,
            providerVerifiedAt: providerVerification.paidAt?.toISOString() ?? null,
          }),
        },
      });

      return {
        payment: updatedPayment,
        providerStatus: providerVerification.status,
      };
    }

    const pendingPayment = await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        metadata: mergeMetadata(payment.metadata, {
          providerVerification: providerVerification.raw,
        }),
      },
    });

    return {
      payment: pendingPayment,
      providerStatus: providerVerification.status,
    };
  },

  async handleWebhook(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      throw new PaymentServiceError("Invalid webhook payload", "BAD_REQUEST");
    }

    const event = "event" in payload && typeof payload.event === "string" ? payload.event : "";
    const data =
      "data" in payload && payload.data && typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : null;
    const reference = data && typeof data.reference === "string" ? data.reference : null;

    if (!reference) {
      return { processed: false, reason: "Missing reference in webhook payload" };
    }

    if (event === "charge.success") {
      const result = await this.verifyPayment(reference);
      return {
        processed: true,
        event,
        reference,
        status: result.payment.status,
      };
    }

    if (event === "charge.failed") {
      await prisma.paymentTransaction.updateMany({
        where: { reference },
        data: { status: PaymentStatus.FAILED },
      });

      return {
        processed: true,
        event,
        reference,
        status: PaymentStatus.FAILED,
      };
    }

    return {
      processed: false,
      event,
      reference,
      reason: "Event ignored",
    };
  },

  async getPaymentHistory(userId: string) {
    return prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
};
