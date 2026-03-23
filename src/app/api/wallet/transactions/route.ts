import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { WalletServiceError, walletService } from "@/lib/services/wallet.service";
import { transactionQuerySchema } from "@/lib/validations/wallet";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const parsed = transactionQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await walletService.getTransactions(user.id, parsed.data);
    return NextResponse.json(result);
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
