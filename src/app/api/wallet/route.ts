import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { WalletServiceError, walletService } from "@/lib/services/wallet.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const wallet = await walletService.getWallet(user.id);
    const balance = await walletService.getBalance(user.id);

    return NextResponse.json({
      wallet: {
        ...wallet,
        balance,
      },
    });
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
