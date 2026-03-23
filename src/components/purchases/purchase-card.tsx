import Link from "next/link";

import { CountdownTimer } from "@/components/purchases/countdown-timer";
import { ProgressBar } from "@/components/purchases/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { formatDate } from "@/lib/utils";

type PurchaseCardProps = {
  purchase: {
    id: string;
    status: "ACTIVE" | "SETTLED" | "REFUNDED";
    completionPercent: number;
    purchasePrice: number;
    expectedProfit: number;
    sellingWindowEnd: Date | string;
    createdAt: Date | string;
    package: {
      id: string;
      name: string;
      category: {
        name: string;
      };
    };
  };
};

const statusToVariant = {
  ACTIVE: "warning",
  SETTLED: "success",
  REFUNDED: "default",
} as const;

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{purchase.package.name}</h3>
          <p className="text-xs text-slate-500">{purchase.package.category.name}</p>
        </div>
        <Badge variant={statusToVariant[purchase.status]}>{purchase.status}</Badge>
      </div>
      <p className="text-sm text-slate-700">
        Purchase amount: <CurrencyDisplay amount={purchase.purchasePrice} />
      </p>
      <p className="text-sm text-slate-700">
        Expected profit: <CurrencyDisplay amount={purchase.expectedProfit} />
      </p>
      <div className="mt-3">
        <p className="mb-1 text-xs text-slate-500">Completion</p>
        <ProgressBar value={purchase.completionPercent} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <CountdownTimer endDate={purchase.sellingWindowEnd} />
        <p className="text-xs text-slate-500">Started {formatDate(purchase.createdAt)}</p>
      </div>
      <Link
        href={`/user/purchases/${purchase.id}`}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        View details
      </Link>
    </Card>
  );
}
