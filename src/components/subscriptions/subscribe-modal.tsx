"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type SubscribeModalProps = {
  open: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    subscriptionFee: number;
  } | null;
};

export function SubscribeModal({ open, onClose, category }: SubscribeModalProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    if (!category) return;

    setError(null);
    setIsSubmitting(true);
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: category.id }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to subscribe.");
      return;
    }

    notify(`Subscription activated: ${category.name}`);
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Subscribe to ${category?.name ?? "category"}`}
      description="Confirm category subscription to unlock package purchases."
    >
      {category ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Subscription fee: <CurrencyDisplay amount={category.subscriptionFee} />
          </p>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm subscription"}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
