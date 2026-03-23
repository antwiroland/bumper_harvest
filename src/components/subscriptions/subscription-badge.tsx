import { SubscriptionStatus } from "@prisma/client";

const statusStyles: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

type SubscriptionBadgeProps = {
  status: SubscriptionStatus;
};

export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
