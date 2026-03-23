import { Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type BalanceDisplayProps = {
  balance: number;
};

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-100">Current Balance</p>
          <p className="mt-2 text-4xl font-semibold">
            <CurrencyDisplay amount={balance} />
          </p>
        </div>
        <span className="rounded-full bg-white/15 p-2">
          <Wallet size={18} />
        </span>
      </div>
    </Card>
  );
}
