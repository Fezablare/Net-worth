import type {
  AppData,
  Holding,
  Owner,
  OwnerTotals,
  Portfolio,
  QuoteCache,
  SnapshotTotals,
} from "./types";

function lineNetForOwner(
  amount: number,
  owner: Owner,
  target: Owner,
): number {
  return owner === target ? amount : 0;
}

export function computeOwnerTotals(
  portfolio: Portfolio,
  quotes: QuoteCache,
): OwnerTotals {
  const totals: OwnerTotals = { felix: 0, kaki: 0, joint: 0, household: 0 };

  for (const owner of ["Felix", "Kaki", "Joint"] as Owner[]) {
    let sum = 0;

    for (const a of portfolio.cash) {
      sum += lineNetForOwner(a.balance, a.owner, owner);
    }
    for (const f of portfolio.super) {
      sum += lineNetForOwner(f.balance, f.owner, owner);
    }
    for (const p of portfolio.properties) {
      const equity = p.value - p.mortgage;
      sum += lineNetForOwner(equity, p.owner, owner);
    }
    for (const h of portfolio.holdings) {
      const { price } = getHoldingPrice(h, quotes);
      sum += lineNetForOwner(price * h.quantity, h.owner, owner);
    }
    for (const d of portfolio.otherDebts) {
      sum -= lineNetForOwner(d.balance, d.owner, owner);
    }

    if (owner === "Felix") totals.felix = sum;
    if (owner === "Kaki") totals.kaki = sum;
    if (owner === "Joint") totals.joint = sum;
  }

  totals.household = totals.felix + totals.kaki + totals.joint;
  return totals;
}

export function computeCashTotal(portfolio: Portfolio): number {
  return portfolio.cash.reduce((sum, a) => sum + a.balance, 0);
}

export function computeSuperTotal(portfolio: Portfolio): number {
  return portfolio.super.reduce((sum, f) => sum + f.balance, 0);
}

export function computePropertyEquity(portfolio: Portfolio): number {
  return portfolio.properties.reduce(
    (sum, p) => sum + p.value - p.mortgage,
    0,
  );
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
    return sum + price * h.quantity;
  }, 0);
}

export function computeOtherDebtsTotal(portfolio: Portfolio): number {
  return portfolio.otherDebts.reduce((sum, d) => sum + d.balance, 0);
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
  const owners = computeOwnerTotals(portfolio, quotes);

  return {
    cash,
    super: superTotal,
    propertyEquity,
    shares,
    otherDebts,
    owners,
    netWorth: cash + superTotal + propertyEquity + shares - otherDebts,
  };
}

export function computeAllocation(totals: SnapshotTotals) {
  const assets = totals.cash + totals.super + totals.propertyEquity + totals.shares;
  const debts = totals.otherDebts;

  return [
    { name: "Cash", value: totals.cash, type: "asset" as const },
    { name: "Super", value: totals.super, type: "asset" as const },
    {
      name: "Property equity",
      value: totals.propertyEquity,
      type: "asset" as const,
    },
    { name: "Shares", value: totals.shares, type: "asset" as const },
    { name: "Other debts", value: debts, type: "debt" as const },
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

export function snapshotChange(
  snapshots: AppData["snapshots"],
  monthKey: string,
): number | null {
  const sorted = [...snapshots].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
  const index = sorted.findIndex((s) => s.monthKey === monthKey);
  if (index <= 0) return null;
  return sorted[index].totals.netWorth - sorted[index - 1].totals.netWorth;
}
