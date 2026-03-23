"use client";

import { TransactionType } from "@prisma/client";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TransactionRow } from "@/components/wallet/transaction-row";

type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string | null;
  createdAt: Date | string;
};

type TransactionTableProps = {
  transactions: TransactionItem[];
};

function toCsv(transactions: TransactionItem[]): string {
  const header = ["Date", "Type", "Amount", "Description", "Reference"];
  const rows = transactions.map((item) => [
    new Date(item.createdAt).toISOString(),
    item.type,
    String(item.amount),
    item.description.replaceAll('"', '""'),
    item.reference ?? "",
  ]);

  return [header, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n");
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const createdAt = new Date(item.createdAt);
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
      if (fromDate && createdAt < fromDate) return false;
      if (toDate) {
        const inclusiveEnd = new Date(toDate);
        inclusiveEnd.setHours(23, 59, 59, 999);
        if (createdAt > inclusiveEnd) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, fromDate, toDate]);

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wallet-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Type</label>
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as "ALL" | TransactionType)}
            >
              <option value="ALL">All</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">From</label>
            <Calendar value={fromDate} onChange={setFromDate} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">To</label>
            <Calendar value={toDate} onChange={setToDate} />
          </div>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          <Download size={14} className="mr-1" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Description</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
