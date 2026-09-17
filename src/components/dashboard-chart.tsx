"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAud, formatMonthKey } from "@/lib/format";
import type { Snapshot } from "@/lib/types";

interface DashboardChartProps {
  snapshots: Snapshot[];
}

export function DashboardChart({ snapshots }: DashboardChartProps) {
  const data = [...snapshots]
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((s) => ({
      month: formatMonthKey(s.monthKey),
      netWorth: s.totals.netWorth,
    }));

  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => [formatAud(Number(value ?? 0)), "Net worth"]}
            labelStyle={{ color: "inherit" }}
          />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
