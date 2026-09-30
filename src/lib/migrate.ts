import { computeTotals } from "./calculations";
import type { AppData, Owner, Portfolio } from "./types";
import { OWNERS } from "./types";

function migrateOwner(item: { owner?: Owner; ownershipPercent?: number }): Owner {
  if (item.owner && OWNERS.includes(item.owner)) {
    return item.owner;
  }
  if (item.ownershipPercent === 100) {
    return "Felix";
  }
  return "Joint";
}

function migratePortfolioItem<T extends { owner?: Owner; ownershipPercent?: number }>(
  item: T,
): Omit<T, "ownershipPercent"> & { owner: Owner } {
  const { ownershipPercent: _removed, ...rest } = item;
  return { ...rest, owner: migrateOwner(item) };
}

function migratePortfolio(portfolio: Portfolio): Portfolio {
  return {
    cash: portfolio.cash.map((item) => migratePortfolioItem(item)),
    super: portfolio.super.map((item) => migratePortfolioItem(item)),
    properties: portfolio.properties.map((item) => migratePortfolioItem(item)),
    holdings: portfolio.holdings.map((item) => migratePortfolioItem(item)),
    otherDebts: portfolio.otherDebts.map((item) => migratePortfolioItem(item)),
  };
}

export function migrateAppData(data: AppData): AppData {
  const portfolio = migratePortfolio(data.portfolio);
  return {
    ...data,
    portfolio,
    snapshots: data.snapshots.map((snapshot) => {
      const migratedPortfolio = migratePortfolio(snapshot.portfolio);
      const quotes = snapshot.quotes ?? {};
      return {
        ...snapshot,
        portfolio: migratedPortfolio,
        totals: computeTotals(migratedPortfolio, quotes),
      };
    }),
  };
}
