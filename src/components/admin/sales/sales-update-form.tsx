"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProgressIndicator } from "@/components/admin/sales/progress-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type SalesRecord = {
  id: string;
  productId: string;
  totalQuantity: number;
  soldQuantity: number;
  product: {
    name: string;
  };
};

type SalesUpdateFormProps = {
  purchaseId: string;
  isWithinSellingWindow: boolean;
  completionPercent: number;
  records: SalesRecord[];
};

export function SalesUpdateForm({
  purchaseId,
  isWithinSellingWindow,
  completionPercent,
  records,
}: SalesUpdateFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [values, setValues] = useState(
    Object.fromEntries(records.map((record) => [record.productId, String(record.soldQuantity)])),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveChanges() {
    setError(null);
    const updates = records.map((record) => ({
      productId: record.productId,
      soldQuantity: Number(values[record.productId] ?? record.soldQuantity),
    }));

    setIsSubmitting(true);
    const response = await fetch(`/api/sales/${purchaseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to save updates.");
      return;
    }

    notify("Sales progress updated");
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Sales update form</h3>
          <p className="text-sm text-slate-500">
            {isWithinSellingWindow
              ? "Update sold quantities per product."
              : "Selling window has closed. Updates are disabled."}
          </p>
        </div>
        <ProgressIndicator value={completionPercent} />
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="grid items-center gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-3"
          >
            <div>
              <p className="font-medium text-slate-900">{record.product.name}</p>
              <p className="text-xs text-slate-500">Total quantity: {record.totalQuantity}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Sold quantity</label>
              <Input
                type="number"
                min={0}
                max={record.totalQuantity}
                value={values[record.productId] ?? "0"}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [record.productId]: event.target.value,
                  }))
                }
                disabled={!isWithinSellingWindow}
              />
            </div>
            <p className="text-sm text-slate-600">Current: {record.soldQuantity}</p>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button onClick={saveChanges} disabled={!isWithinSellingWindow || isSubmitting}>
        {isSubmitting ? "Saving..." : "Save progress"}
      </Button>
    </Card>
  );
}
