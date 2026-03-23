"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { WithdrawModal } from "@/components/wallet/withdraw-modal";

export function WalletActions() {
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpenDeposit(true)}>Deposit</Button>
        <Button variant="secondary" onClick={() => setOpenWithdraw(true)}>
          Withdraw
        </Button>
      </div>
      <DepositModal open={openDeposit} onClose={() => setOpenDeposit(false)} />
      <WithdrawModal open={openWithdraw} onClose={() => setOpenWithdraw(false)} />
    </>
  );
}
