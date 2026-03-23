import type { ReactNode } from "react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <CardDescription className="mb-0 text-xs uppercase tracking-wide">{label}</CardDescription>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
      </div>
      <CardTitle className="text-2xl">{value}</CardTitle>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
