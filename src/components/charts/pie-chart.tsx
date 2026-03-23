"use client";

import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

type Point = {
  [key: string]: string | number;
};

type PieChartProps = {
  data: Point[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
};

const defaultColors = ["#166534", "#15803d", "#22c55e", "#84cc16", "#facc15", "#fb7185"];

export function PieChart({ data, nameKey, valueKey, colors = defaultColors }: PieChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState title="No chart data" description="No slices available for this chart yet." />
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={100} label>
            {data.map((_, index) => (
              <Cell key={`slice-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
