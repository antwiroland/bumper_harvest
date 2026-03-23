import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type WalletCardProps = {
  balance: number;
};

export function WalletCard({ balance }: WalletCardProps) {
  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
      <CardDescription className="mb-2 text-emerald-100">Wallet Balance</CardDescription>
      <CardTitle className="text-3xl text-white">
        <CurrencyDisplay amount={balance} />
      </CardTitle>
      <div className="mt-5 flex gap-2">
        <Link
          href="/user/wallet"
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          Deposit
        </Link>
        <Link
          href="/user/wallet"
          className="rounded-lg border border-white/40 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Withdraw
        </Link>
      </div>
    </Card>
  );
}
