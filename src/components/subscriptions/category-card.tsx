import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { SubscriptionBadge } from "@/components/subscriptions/subscription-badge";

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    description: string | null;
    packagePrice: number;
    subscriptionFee: number;
    packageCount: number;
  };
  subscriptionStatus?: "ACTIVE" | "EXPIRED" | "CANCELLED";
  onSubscribe: (categoryId: string) => void;
};

export function CategoryCard({ category, subscriptionStatus, onSubscribe }: CategoryCardProps) {
  const isActive = subscriptionStatus === "ACTIVE";

  return (
    <Card className="h-full">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {category.description ?? "Category subscription gives package access."}
          </p>
        </div>
        <ShieldCheck size={18} className="text-primary" />
      </div>
      <div className="space-y-1 text-sm text-slate-700">
        <p>
          Subscription fee: <CurrencyDisplay amount={category.subscriptionFee} />
        </p>
        <p>
          Package price: <CurrencyDisplay amount={category.packagePrice} />
        </p>
        <p>Packages: {category.packageCount}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {subscriptionStatus ? <SubscriptionBadge status={subscriptionStatus} /> : <span />}
        <Button size="sm" onClick={() => onSubscribe(category.id)} disabled={isActive}>
          {isActive ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
    </Card>
  );
}
