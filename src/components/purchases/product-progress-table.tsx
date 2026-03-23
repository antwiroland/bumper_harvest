import { ProgressBar } from "@/components/purchases/progress-bar";

type ProductProgressTableProps = {
  products: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    soldQuantity: number;
    completionPercent: number;
  }>;
};

export function ProductProgressTable({ products }: ProductProgressTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Sold / Total</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Progress</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.productId} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-700">{item.productName}</td>
                <td className="px-4 py-3 text-slate-700">
                  {item.soldQuantity} / {item.totalQuantity}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={item.completionPercent} className="w-44" />
                    <span className="text-xs text-slate-600">
                      {item.completionPercent.toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
