"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type DepositModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DepositModal({ open, onClose }: DepositModalProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Wallet deposit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDeposit() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parsedAmount,
        description: description.trim() || "Wallet deposit",
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Deposit failed.");
      return;
    }

    setAmount("");
    setDescription("Wallet deposit");
    notify("Deposit successful");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deposit funds"
      description="Add funds to your wallet balance."
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Amount</label>
          <Input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <Input value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submitDeposit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm deposit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
