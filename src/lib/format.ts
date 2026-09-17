const audFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const audFormatterPrecise = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAud(value: number, precise = false): string {
  if (!Number.isFinite(value)) return "—";
  return precise ? audFormatterPrecise.format(value) : audFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatChange(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatAud(value)}`;
}
