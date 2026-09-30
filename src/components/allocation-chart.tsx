"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatAud } from "@/lib/format";

const COLORS = [
  "hsl(220 70% 50%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 65% 60%)",
  "hsl(0 70% 55%)",
];

interface AllocationChartProps {
  items: { name: string; value: number; type: "asset" | "debt" }[];
}

export function AllocationChart({ items }: AllocationChartProps) {
  const chartData = items
    .filter((i) => i.value > 0)
    .map((i) => ({
      name: i.name,
      value: i.value,
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatAud(Number(value ?? 0))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
        {chartData.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{item.name}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">
              {formatAud(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
