export interface CashAccount {
  id: string;
  name: string;
  balance: number;
  ownershipPercent: number;
}

export interface SuperFund {
  id: string;
  name: string;
  balance: number;
  ownershipPercent: number;
}

export interface Property {
  id: string;
  name: string;
  value: number;
  mortgage: number;
  ownershipPercent: number;
}

export interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  ownershipPercent: number;
  manualPrice?: number;
}

export interface OtherDebt {
  id: string;
  name: string;
  balance: number;
  ownershipPercent: number;
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

export interface SnapshotTotals {
  netWorth: number;
  cash: number;
  super: number;
  propertyEquity: number;
  shares: number;
  otherDebts: number;
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
