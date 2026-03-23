import Link from "next/link";
import { ArrowRight, CreditCard, Package, ShieldCheck, Wallet } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";

const actions = [
  {
    label: "Fund wallet",
    description: "Add balance before purchasing packages.",
    href: "/user/wallet",
    icon: Wallet,
  },
  {
    label: "Subscribe to category",
    description: "Activate a category to unlock package purchases.",
    href: "/user/subscriptions",
    icon: ShieldCheck,
  },
  {
    label: "Browse packages",
    description: "Review package products and expected returns.",
    href: "/user/packages",
    icon: Package,
  },
  {
    label: "My wallet transactions",
    description: "View your full debit and credit history.",
    href: "/user/wallet",
    icon: CreditCard,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardTitle className="mb-4 text-lg">Quick actions</CardTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-slate-50"
          >
            <action.icon size={18} className="mb-2 text-primary" />
            <p className="font-medium text-slate-900">{action.label}</p>
            <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
