"use client";

import dynamic from "next/dynamic";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type EarningsPoint = {
  date: string;
  earnings: number;
};

type EarningsChartProps = {
  data: EarningsPoint[];
};

const LazyLineChart = dynamic(
  () => import("@/components/charts/line-chart").then((module) => module.LineChart),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-xl bg-slate-100" />,
  },
);

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card>
      <CardTitle className="text-lg">Earnings trend</CardTitle>
      <CardDescription>Expected earnings from your latest package purchases</CardDescription>
      <div className="mt-4">
        <LazyLineChart data={data} xKey="date" yKey="earnings" />
      </div>
    </Card>
  );
}
