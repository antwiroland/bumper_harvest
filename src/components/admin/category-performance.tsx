import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type CategoryPerformanceProps = {
  categories: Array<{
    categoryId: string;
    categoryName: string;
    purchaseCount: number;
    subscriptions: number;
    totalPurchaseVolume: number;
    totalExpectedProfit: number;
  }>;
};

export function CategoryPerformance({ categories }: CategoryPerformanceProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">Top category performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Subscriptions</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Purchases</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Volume</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Expected Profit</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item.categoryId} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-700">{item.categoryName}</td>
                <td className="px-4 py-3 text-slate-700">{item.subscriptions}</td>
                <td className="px-4 py-3 text-slate-700">{item.purchaseCount}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(item.totalPurchaseVolume)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(item.totalExpectedProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
