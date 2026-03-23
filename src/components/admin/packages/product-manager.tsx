"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type ProductManagerProps = {
  packageId: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
  }>;
};

export function ProductManager({ packageId, products }: ProductManagerProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/packages/${packageId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
      }),
    });

    setIsSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to add product.");
      return;
    }

    setName("");
    setQuantity("");
    setCostPrice("");
    setSellingPrice("");
    notify("Product added");
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Product manager</h3>
        <p className="text-sm text-slate-500">Add products to this package.</p>
      </div>

      <form onSubmit={addProduct} className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Product name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          placeholder="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <Input
          placeholder="Cost price"
          type="number"
          min={0.01}
          step="0.01"
          value={costPrice}
          onChange={(event) => setCostPrice(event.target.value)}
        />
        <Input
          placeholder="Selling price"
          type="number"
          min={0.01}
          step="0.01"
          value={sellingPrice}
          onChange={(event) => setSellingPrice(event.target.value)}
        />
        {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add product"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No products added yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
