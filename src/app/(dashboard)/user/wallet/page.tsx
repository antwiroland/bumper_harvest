import { PageHeader } from "@/components/ui/page-header";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { TransactionTable } from "@/components/wallet/transaction-table";
import { WalletActions } from "@/components/wallet/wallet-actions";
import { requireUser } from "@/lib/auth-utils";
import { walletService } from "@/lib/services/wallet.service";

export default async function UserWalletPage() {
  const user = await requireUser();
  const [wallet, transactions] = await Promise.all([
    walletService.getWallet(user.id),
    walletService.getTransactions(user.id, { page: 1, limit: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Manage your funds, monitor transaction history, and export records."
        actions={<WalletActions />}
      />
      <BalanceDisplay balance={wallet.balance} />
      <TransactionTable transactions={transactions.transactions} />
    </div>
  );
}
