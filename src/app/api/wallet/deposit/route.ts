import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { WalletServiceError, walletService } from "@/lib/services/wallet.service";
import { depositSchema } from "@/lib/validations/wallet";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const description = parsed.data.description ?? "Wallet deposit";
    const reference = parsed.data.reference ?? `DEP-${randomUUID()}`;
    const result = await walletService.credit(user.id, parsed.data.amount, description, reference);

    return NextResponse.json(
      {
        message: "Deposit processed successfully",
        ...result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WalletServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
