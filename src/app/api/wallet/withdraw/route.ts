import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { WalletServiceError, walletService } from "@/lib/services/wallet.service";
import { withdrawalSchema } from "@/lib/validations/wallet";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = withdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const description =
      parsed.data.description ??
      `Withdrawal request - ${parsed.data.bankName} (${parsed.data.accountNumber})`;
    const reference = `WDR-${randomUUID()}`;
    const result = await walletService.debit(user.id, parsed.data.amount, description, reference);

    return NextResponse.json(
      {
        message: "Withdrawal request created successfully",
        metadata: {
          accountName: parsed.data.accountName,
          accountNumber: parsed.data.accountNumber,
          bankName: parsed.data.bankName,
        },
        ...result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WalletServiceError) {
      const statusMap: Record<WalletServiceError["code"], number> = {
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        INSUFFICIENT_BALANCE: 422,
      };
      return NextResponse.json({ error: error.message }, { status: statusMap[error.code] });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
