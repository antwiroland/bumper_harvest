import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type ActivePackagesCardProps = {
  activeCount: number;
  settledCount: number;
};

export function ActivePackagesCard({ activeCount, settledCount }: ActivePackagesCardProps) {
  return (
    <Card>
      <CardDescription className="mb-2">Packages</CardDescription>
      <CardTitle className="text-3xl">{activeCount}</CardTitle>
      <p className="mt-1 text-sm text-slate-500">Active package purchases</p>
      <p className="mt-4 text-sm text-slate-600">
        Settled purchases: <span className="font-semibold text-slate-900">{settledCount}</span>
      </p>
      <Link href="/user/packages" className="mt-4 inline-block text-sm font-medium text-primary">
        Browse packages
      </Link>
    </Card>
  );
}
