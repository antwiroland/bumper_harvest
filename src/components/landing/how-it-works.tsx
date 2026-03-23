import { Card } from "@/components/ui/card";

const STEPS = [
  "Fund your wallet and activate a category subscription.",
  "Buy a package inside your subscribed category.",
  "Monitor product sales progress during the 7-day window.",
  "Receive automatic settlement when the window closes.",
];

export function HowItWorks() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {STEPS.map((step, index) => (
          <Card key={step} className="flex gap-4 p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </div>
            <p className="text-sm text-slate-700">{step}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
