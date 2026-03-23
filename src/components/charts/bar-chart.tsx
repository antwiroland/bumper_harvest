"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

type Point = {
  [key: string]: string | number;
};

type BarChartProps = {
  data: Point[];
  xKey: string;
  yKey: string;
  fill?: string;
};

export function BarChart({ data, xKey, yKey, fill = "#166534" }: BarChartProps) {
  if (data.length === 0) {
    return <EmptyState title="No chart data" description="No bars available for this chart yet." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Bar dataKey={yKey} fill={fill} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
