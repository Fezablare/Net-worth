export type Owner = "Felix" | "Kaki" | "Joint";

export const OWNERS: Owner[] = ["Felix", "Kaki", "Joint"];

export interface CashAccount {
  id: string;
  name: string;
  balance: number;
  owner: Owner;
}

export interface SuperFund {
  id: string;
  name: string;
  balance: number;
  owner: Owner;
}

export interface Property {
  id: string;
  name: string;
  value: number;
  mortgage: number;
  owner: Owner;
}

export interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  owner: Owner;
  manualPrice?: number;
}

export interface OtherDebt {
  id: string;
  name: string;
  balance: number;
  owner: Owner;
}

export interface QuoteInfo {
  price: number;
  asOf: string;
  stale?: boolean;
}

export type QuoteCache = Record<string, QuoteInfo>;

export interface Portfolio {
  cash: CashAccount[];
  super: SuperFund[];
  properties: Property[];
  holdings: Holding[];
  otherDebts: OtherDebt[];
}

export interface OwnerTotals {
  felix: number;
  kaki: number;
  joint: number;
  household: number;
}

export interface SnapshotTotals {
  netWorth: number;
  cash: number;
  super: number;
  propertyEquity: number;
  shares: number;
  otherDebts: number;
  owners: OwnerTotals;
}

export interface Snapshot {
  monthKey: string;
  savedAt: string;
  totals: SnapshotTotals;
  portfolio: Portfolio;
  quotes: QuoteCache;
}

export interface AppData {
  portfolio: Portfolio;
  snapshots: Snapshot[];
  quoteCache: QuoteCache;
}

/** @deprecated Legacy field — migrated on read */
export type LegacyLineItem = {
  ownershipPercent?: number;
  owner?: Owner;
};
