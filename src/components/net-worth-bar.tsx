"use client";

import { formatAud } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NetWorthBarProps {
  netWorth: number;
  label?: string;
  className?: string;
}

export function NetWorthBar({ netWorth, label = "Net worth", className }: NetWorthBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-4 border-t bg-card/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-xl md:border md:px-5 md:py-4",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums md:text-3xl">
        {formatAud(netWorth)}
      </p>
    </div>
  );
}
