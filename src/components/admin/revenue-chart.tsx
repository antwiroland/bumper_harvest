"use client";

import dynamic from "next/dynamic";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type RevenuePoint = {
  date: string;
  grossRevenue: number;
  commission: number;
  payout: number;
};

type RevenueChartProps = {
  data: RevenuePoint[];
};

const LazyAreaChart = dynamic(
  () => import("@/components/charts/area-chart").then((module) => module.AreaChart),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-xl bg-slate-100" />,
  },
);

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardTitle className="text-lg">Revenue trend</CardTitle>
      <CardDescription>Last 30 days gross revenue and commissions</CardDescription>
      <div className="mt-4">
        <LazyAreaChart data={data} xKey="date" yKey="grossRevenue" />
      </div>
    </Card>
  );
}
