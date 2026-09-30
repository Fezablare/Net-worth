"use client";

import { OWNERS, type Owner } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OwnerSelectProps {
  value: Owner;
  onChange: (owner: Owner) => void;
  className?: string;
}

export function OwnerSelect({ value, onChange, className }: OwnerSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Owner)}
      className={cn(
        "h-8 rounded-md border border-border bg-input/50 px-2 text-xs font-medium text-foreground",
        value === "Joint" && "text-sky-400",
        className,
      )}
      aria-label="Owner"
    >
      {OWNERS.map((owner) => (
        <option key={owner} value={owner}>
          {owner}
        </option>
      ))}
    </select>
  );
}
