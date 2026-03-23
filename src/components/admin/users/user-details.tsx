import { UserActions } from "@/components/admin/users/user-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { formatDate } from "@/lib/utils";

type UserDetailsProps = {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "USER" | "ADMIN";
    createdAt: Date | string;
    wallet: { balance: number } | null;
    subscriptions: Array<{ id: string; status: string; category: { name: string } }>;
    purchases: Array<{
      id: string;
      status: string;
      purchasePrice: number;
      package: { name: string; category: { name: string } };
    }>;
  };
  stats: {
    walletBalance: number;
    purchases: { total: number; active: number; settled: number; refunded: number };
    finance: { totalInvested: number; totalPayout: number; totalExpectedProfit: number };
  };
};

export function UserDetails({ user, stats }: UserDetailsProps) {
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-500">Joined {formatDate(user.createdAt)}</p>
          </div>
          <Badge variant={user.role === "ADMIN" ? "warning" : "default"}>{user.role}</Badge>
        </div>
        <p className="text-sm text-slate-700">
          Wallet balance: <CurrencyDisplay amount={stats.walletBalance} />
        </p>
        <UserActions userId={user.id} currentRole={user.role} />
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Finance summary</h3>
        <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <p>
            Invested: <CurrencyDisplay amount={stats.finance.totalInvested} />
          </p>
          <p>
            Payout: <CurrencyDisplay amount={stats.finance.totalPayout} />
          </p>
          <p>
            Expected profit: <CurrencyDisplay amount={stats.finance.totalExpectedProfit} />
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Subscriptions</h3>
        <ul className="space-y-2 text-sm">
          {user.subscriptions.slice(0, 10).map((subscription) => (
            <li
              key={subscription.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
            >
              <span>{subscription.category.name}</span>
              <Badge>{subscription.status}</Badge>
            </li>
          ))}
          {user.subscriptions.length === 0 ? (
            <li className="text-slate-500">No subscriptions.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Recent purchases</h3>
        <ul className="space-y-2 text-sm">
          {user.purchases.slice(0, 10).map((purchase) => (
            <li key={purchase.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{purchase.package.name}</span>
                <Badge>{purchase.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">{purchase.package.category.name}</p>
              <p className="text-xs text-slate-600">
                Amount: <CurrencyDisplay amount={purchase.purchasePrice} />
              </p>
            </li>
          ))}
          {user.purchases.length === 0 ? <li className="text-slate-500">No purchases.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
