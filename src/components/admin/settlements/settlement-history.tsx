import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { formatDate } from "@/lib/utils";

type SettlementHistoryProps = {
  settlements: Array<{
    id: string;
    purchaseId: string;
    status: string;
    payout: number;
    commission: number;
    completionPct: number;
    processedAt: Date | string;
  }>;
};

export function SettlementHistory({ settlements }: SettlementHistoryProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">Settlement history</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Purchase</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Completion</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Payout</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Commission</th>
            </tr>
          </thead>
          <tbody>
            {settlements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No settlement records yet.
                </td>
              </tr>
            ) : (
              settlements.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{formatDate(item.processedAt)}</td>
                  <td className="px-4 py-3 text-slate-700">{item.purchaseId}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === "SETTLED" ? "success" : "default"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.completionPct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-slate-700">
                    <CurrencyDisplay amount={item.payout} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <CurrencyDisplay amount={item.commission} />
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
