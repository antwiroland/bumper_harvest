import { TransactionType } from "@prisma/client";
import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { formatDate } from "@/lib/utils";

type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: Date;
};

type RecentTransactionsProps = {
  transactions: TransactionItem[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
          <CardDescription>Latest wallet activity</CardDescription>
        </div>
        <Link href="/user/wallet" className="text-sm font-medium text-primary">
          View all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-500">No transactions yet.</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{item.description}</p>
                <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  item.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {item.type === "CREDIT" ? "+" : "-"}
                <CurrencyDisplay amount={item.amount} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
