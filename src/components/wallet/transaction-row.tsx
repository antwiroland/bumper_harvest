import { TransactionType } from "@prisma/client";

import { CurrencyDisplay } from "@/components/ui/currency-display";
import { formatDate } from "@/lib/utils";

type TransactionRowProps = {
  transaction: {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    reference: string | null;
    createdAt: Date | string;
  };
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 text-slate-700">{formatDate(transaction.createdAt)}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            transaction.type === "CREDIT"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {transaction.type}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-700">{transaction.description}</td>
      <td className="px-4 py-3 text-slate-500">{transaction.reference ?? "-"}</td>
      <td className="px-4 py-3 text-right font-semibold text-slate-900">
        <CurrencyDisplay amount={transaction.amount} />
      </td>
    </tr>
  );
}
