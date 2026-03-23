"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

type Point = {
  [key: string]: string | number;
};

type LineChartProps = {
  data: Point[];
  xKey: string;
  yKey: string;
  stroke?: string;
};

export function LineChart({ data, xKey, yKey, stroke = "#166534" }: LineChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState title="No chart data" description="No points available for this chart yet." />
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Line dataKey={yKey} type="monotone" stroke={stroke} strokeWidth={2} dot={{ r: 3 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
