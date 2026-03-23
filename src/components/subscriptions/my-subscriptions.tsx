import { Card } from "@/components/ui/card";
import { SubscriptionBadge } from "@/components/subscriptions/subscription-badge";
import { formatDate } from "@/lib/utils";

type MySubscriptionsProps = {
  subscriptions: Array<{
    id: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    createdAt: Date | string;
    category: {
      id: string;
      name: string;
      packagePrice: number;
      subscriptionFee: number;
    };
  }>;
};

export function MySubscriptions({ subscriptions }: MySubscriptionsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">My subscriptions</h3>
      <p className="mb-4 text-sm text-slate-500">Active and historical category subscriptions</p>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-slate-500">No subscriptions yet.</p>
      ) : (
        <ul className="space-y-3">
          {subscriptions.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center"
            >
              <div>
                <p className="font-medium text-slate-900">{item.category.name}</p>
                <p className="text-xs text-slate-500">Started {formatDate(item.createdAt)}</p>
              </div>
              <SubscriptionBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
