"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
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

type AreaChartProps = {
  data: Point[];
  xKey: string;
  yKey: string;
  color?: string;
};

export function AreaChart({ data, xKey, yKey, color = "#166534" }: AreaChartProps) {
  if (data.length === 0) {
    return <EmptyState title="No chart data" description="No area points available yet." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="chart-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Area type="monotone" dataKey={yKey} stroke={color} fill="url(#chart-area-fill)" />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
