import { ShieldCheck, TrendingUp, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Capital protection",
    description: "If a package underperforms, your package purchase amount is refunded in full.",
    icon: ShieldCheck,
  },
  {
    title: "Profit visibility",
    description:
      "Track completion percentages and expected earnings per purchase in one dashboard.",
    icon: TrendingUp,
  },
  {
    title: "Wallet-first flow",
    description: "Deposits, purchases, and payouts are recorded as auditable wallet transactions.",
    icon: Wallet,
  },
];

export function Features() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Why users choose Bumper Harvest</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((item) => (
          <Card key={item.title} className="h-full">
            <item.icon className="mb-4 text-primary" size={20} />
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
