"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type PendingSettlementsProps = {
  purchases: Array<{
    id: string;
    completionPercent: number;
    purchasePrice: number;
    expectedProfit: number;
    sellingWindowEnd: Date | string;
    user: {
      name: string | null;
      email: string;
    };
    package: {
      name: string;
      category: { name: string };
    };
  }>;
};

export function PendingSettlements({ purchases }: PendingSettlementsProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  async function settleOne(purchaseId: string) {
    setLoadingId(purchaseId);
    const response = await fetch(`/api/settlement/${purchaseId}`, { method: "POST" });
    setLoadingId(null);
    if (!response.ok) return;
    notify("Settlement processed");
    router.refresh();
  }

  async function settleAll() {
    setProcessingAll(true);
    const response = await fetch("/api/settlement/run-manual", { method: "POST" });
    setProcessingAll(false);
    if (!response.ok) return;
    notify("Manual settlement run completed");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Pending settlements</h3>
        <Button size="sm" onClick={settleAll} disabled={processingAll || purchases.length === 0}>
          {processingAll ? "Processing..." : "Process all"}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">User</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Package</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Progress</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Window End</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No pending settlements.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">
                    {purchase.user.name ?? purchase.user.email}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{purchase.package.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {purchase.completionPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <CurrencyDisplay amount={purchase.purchasePrice} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(purchase.sellingWindowEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      onClick={() => settleOne(purchase.id)}
                      disabled={loadingId === purchase.id}
                    >
                      {loadingId === purchase.id ? "Processing..." : "Settle"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
