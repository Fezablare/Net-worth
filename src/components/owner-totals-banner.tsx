"use client";

import { formatAud } from "@/lib/format";
import type { OwnerTotals } from "@/lib/types";

interface OwnerTotalsBannerProps {
  owners: OwnerTotals;
  compact?: boolean;
}

export function OwnerTotalsBanner({ owners, compact }: OwnerTotalsBannerProps) {
  const items = [
    { label: "Felix", value: owners.felix },
    { label: "Kaki", value: owners.kaki },
    { label: "Joint", value: owners.joint },
    { label: "Household", value: owners.household, highlight: true },
  ];

  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
          : "grid grid-cols-2 gap-4 border-t border-border/50 pt-4 sm:grid-cols-4"
      }
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p
            className={`font-mono text-sm tabular-nums sm:text-base ${
              item.highlight ? "text-emerald-400" : "text-foreground"
            }`}
          >
            {formatAud(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
