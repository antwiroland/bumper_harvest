import { CurrencyDisplay } from "@/components/ui/currency-display";

type ProductListProps = {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
  }>;
};

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Qty</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Cost</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Selling</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-700">{product.name}</td>
                <td className="px-4 py-3 text-slate-700">{product.quantity}</td>
                <td className="px-4 py-3 text-slate-700">
                  <CurrencyDisplay amount={product.costPrice} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <CurrencyDisplay amount={product.sellingPrice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
