import type { CategoryId } from "./categories";
import type {
  AppData,
  Holding,
  Portfolio,
  QuoteCache,
  SnapshotTotals,
} from "./types";

function ownershipShare(amount: number, ownershipPercent: number): number {
  return amount * (ownershipPercent / 100);
}

export function computeCashTotal(portfolio: Portfolio): number {
  return portfolio.cash.reduce(
    (sum, a) => sum + ownershipShare(a.balance, a.ownershipPercent),
    0,
  );
}

export function computeSuperTotal(portfolio: Portfolio): number {
  return portfolio.super.reduce(
    (sum, f) => sum + ownershipShare(f.balance, f.ownershipPercent),
    0,
  );
}

export function computePropertyEquity(portfolio: Portfolio): number {
  return portfolio.properties.reduce((sum, p) => {
    const valueShare = ownershipShare(p.value, p.ownershipPercent);
    const mortgageShare = ownershipShare(p.mortgage, p.ownershipPercent);
    return sum + valueShare - mortgageShare;
  }, 0);
}

export function getHoldingPrice(
  holding: Holding,
  quotes: QuoteCache,
): { price: number; stale: boolean; asOf?: string } {
  const quote = quotes[holding.ticker.toUpperCase()];
  if (quote) {
    return { price: quote.price, stale: !!quote.stale, asOf: quote.asOf };
  }
  if (holding.manualPrice != null && holding.manualPrice > 0) {
    return { price: holding.manualPrice, stale: true, asOf: undefined };
  }
  return { price: 0, stale: true, asOf: undefined };
}

export function computeSharesTotal(
  portfolio: Portfolio,
  quotes: QuoteCache,
): number {
  return portfolio.holdings.reduce((sum, h) => {
    const { price } = getHoldingPrice(h, quotes);
    const marketValue = price * h.quantity;
    return sum + ownershipShare(marketValue, h.ownershipPercent);
  }, 0);
}

export function computeOtherDebtsTotal(portfolio: Portfolio): number {
  return portfolio.otherDebts.reduce(
    (sum, d) => sum + ownershipShare(d.balance, d.ownershipPercent),
    0,
  );
}

export function computeTotals(
  portfolio: Portfolio,
  quotes: QuoteCache,
): SnapshotTotals {
  const cash = computeCashTotal(portfolio);
  const superTotal = computeSuperTotal(portfolio);
  const propertyEquity = computePropertyEquity(portfolio);
  const shares = computeSharesTotal(portfolio, quotes);
  const otherDebts = computeOtherDebtsTotal(portfolio);

  return {
    cash,
    super: superTotal,
    propertyEquity,
    shares,
    otherDebts,
    netWorth: cash + superTotal + propertyEquity + shares - otherDebts,
  };
}

export function computeAllocation(totals: SnapshotTotals) {
  const assets = totals.cash + totals.super + totals.propertyEquity + totals.shares;
  const debts = totals.otherDebts;

  return [
    { id: "cash" as CategoryId, name: "Cash", value: totals.cash, type: "asset" as const },
    { id: "super" as CategoryId, name: "Super", value: totals.super, type: "asset" as const },
    {
      id: "property" as CategoryId,
      name: "Property equity",
      value: totals.propertyEquity,
      type: "asset" as const,
    },
    { id: "shares" as CategoryId, name: "Shares", value: totals.shares, type: "asset" as const },
    { id: "debt" as CategoryId, name: "Other debts", value: debts, type: "debt" as const },
  ].filter((item) => item.value !== 0 || assets + debts === 0);
}

export function monthOverMonthChange(snapshots: AppData["snapshots"]): number | null {
  if (snapshots.length < 2) return null;
  const sorted = [...snapshots].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  return latest.totals.netWorth - previous.totals.netWorth;
}
