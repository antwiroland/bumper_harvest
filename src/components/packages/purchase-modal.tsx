"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type PurchaseModalProps = {
  open: boolean;
  onClose: () => void;
  pkg: {
    id: string;
    name: string;
    categoryName: string;
    price: number;
    expectedProfit: number;
  };
};

export function PurchaseModal({ open, onClose, pkg }: PurchaseModalProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    setError(null);
    setIsSubmitting(true);
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkg.id }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Purchase failed.");
      return;
    }

    notify(`Purchase successful: ${pkg.name}`);
    onClose();
    router.push("/user/purchases");
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm package purchase"
      description="Purchases are debited from your wallet balance."
    >
      <div className="space-y-2 text-sm text-slate-700">
        <p>Package: {pkg.name}</p>
        <p>Category: {pkg.categoryName}</p>
        <p>
          Price: <CurrencyDisplay amount={pkg.price} />
        </p>
        <p>
          Expected profit: <CurrencyDisplay amount={pkg.expectedProfit} />
        </p>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handlePurchase} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Confirm purchase"}
        </Button>
      </div>
    </Modal>
  );
}
