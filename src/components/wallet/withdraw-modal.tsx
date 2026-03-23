"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitWithdrawal() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) {
      setError("Complete all account details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parsedAmount,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Withdrawal failed.");
      return;
    }

    setAmount("");
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    notify("Withdrawal request submitted");
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Withdraw funds"
      description="Request a withdrawal to your bank account."
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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Account name</label>
            <Input value={accountName} onChange={(event) => setAccountName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Account number</label>
            <Input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Bank name</label>
          <Input value={bankName} onChange={(event) => setBankName(event.target.value)} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submitWithdrawal} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit request"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
