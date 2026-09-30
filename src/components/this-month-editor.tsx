"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OwnerSelect } from "@/components/owner-select";
import { OwnerTotalsBanner } from "@/components/owner-totals-banner";
import {
  computeTotals,
  getHoldingPrice,
  snapshotChange,
} from "@/lib/calculations";
import {
  currentMonthKey,
  formatAud,
  formatChange,
  formatMonthKey,
} from "@/lib/format";
import type {
  AppData,
  CashAccount,
  Holding,
  OtherDebt,
  Owner,
  Portfolio,
  Property,
  SuperFund,
} from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function numInput(value: number, onChange: (n: number) => void) {
  return (
    <input
      type="number"
      step="any"
      className="ledger-input"
      value={value || ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? 0 : Number(e.target.value))
      }
    />
  );
}

interface ThisMonthEditorProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function ThisMonthEditor({ data, onSave }: ThisMonthEditorProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>(data.portfolio);
  const [quoteCache, setQuoteCache] = useState(data.quoteCache);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  const totals = useMemo(
    () => computeTotals(portfolio, quoteCache),
    [portfolio, quoteCache],
  );

  const monthKey = currentMonthKey();
  const existingSnapshot = data.snapshots.find((s) => s.monthKey === monthKey);
  const vsPrior = snapshotChange(data.snapshots, monthKey);
  const priorMonth = [...data.snapshots]
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .find((s) => s.monthKey < monthKey);

  const periodEnd = new Date();
  const periodLabel = periodEnd.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function persistPortfolio() {
    await onSave({ ...data, portfolio, quoteCache });
  }

  async function refreshQuotes() {
    setRefreshing(true);
    try {
      await persistPortfolio();
      const manualPrices: Record<string, number> = {};
      for (const h of portfolio.holdings) {
        if (h.manualPrice && h.manualPrice > 0) {
          manualPrices[h.ticker] = h.manualPrice;
        }
      }
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickers: portfolio.holdings.map((h) => h.ticker),
          manualPrices,
        }),
      });
      if (!res.ok) throw new Error("Quote refresh failed");
      const json = await res.json();
      setQuoteCache(json.quotes);
      toast.success("Share prices updated");
    } catch {
      toast.error("Could not refresh prices — showing last known values");
    } finally {
      setRefreshing(false);
    }
  }

  async function saveSnapshot(replace = false) {
    setSaving(true);
    try {
      await persistPortfolio();
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthKey, replace }),
      });
      if (res.status === 409) {
        setReplaceOpen(true);
        return;
      }
      if (!res.ok) throw new Error("Save failed");
      toast.success(`Snapshot saved for ${formatMonthKey(monthKey)}`);
    } catch {
      toast.error("Could not save snapshot");
    } finally {
      setSaving(false);
    }
  }

  function updateCash(index: number, patch: Partial<CashAccount>) {
    const cash = [...portfolio.cash];
    cash[index] = { ...cash[index], ...patch };
    setPortfolio({ ...portfolio, cash });
  }

  function updateSuper(index: number, patch: Partial<SuperFund>) {
    const superFunds = [...portfolio.super];
    superFunds[index] = { ...superFunds[index], ...patch };
    setPortfolio({ ...portfolio, super: superFunds });
  }

  function updateProperty(index: number, patch: Partial<Property>) {
    const properties = [...portfolio.properties];
    properties[index] = { ...properties[index], ...patch };
    setPortfolio({ ...portfolio, properties });
  }

  function updateHolding(index: number, patch: Partial<Holding>) {
    const holdings = [...portfolio.holdings];
    holdings[index] = { ...holdings[index], ...patch };
    setPortfolio({ ...portfolio, holdings });
  }

  function updateDebt(index: number, patch: Partial<OtherDebt>) {
    const otherDebts = [...portfolio.otherDebts];
    otherDebts[index] = { ...otherDebts[index], ...patch };
    setPortfolio({ ...portfolio, otherDebts });
  }

  const monthName = formatMonthKey(monthKey);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">This month</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update balances for {monthName} — takes about two minutes.
          </p>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right">
          Period · {periodLabel}
        </p>
      </div>

      <div className="ledger-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Live net worth
            </p>
            <p className="ledger-mono mt-1 text-3xl font-medium text-foreground sm:text-4xl">
              {formatAud(totals.netWorth)}
            </p>
            {priorMonth && vsPrior != null && (
              <p className="mt-2 text-xs text-muted-foreground">
                vs. {formatMonthKey(priorMonth.monthKey)}{" "}
                <span
                  className={
                    vsPrior >= 0 ? "text-emerald-400" : "text-red-400"
                  }
                >
                  {formatChange(vsPrior)}
                </span>
              </p>
            )}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500/90">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Recalculates as you type
            </p>
          </div>
          <button
            type="button"
            onClick={() => saveSnapshot(false)}
            disabled={saving}
            className="shrink-0 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            Save {monthName.split(" ")[0]} snapshot
          </button>
        </div>
        <OwnerTotalsBanner owners={totals.owners} />
      </div>

      {existingSnapshot && (
        <p className="text-xs text-amber-400/90">
          A snapshot already exists for this month. Saving again will ask you to
          confirm replacement.
        </p>
      )}

      <LedgerSection
        title={`Cash (${portfolio.cash.length} account${portfolio.cash.length === 1 ? "" : "s"})`}
        onAdd={() =>
          setPortfolio({
            ...portfolio,
            cash: [
              ...portfolio.cash,
              {
                id: newId("cash"),
                name: "",
                balance: 0,
                owner: "Felix" as Owner,
              },
            ],
          })
        }
      >
        {portfolio.cash.map((item, index) => (
          <LedgerRow
            key={item.id}
            onRemove={() =>
              setPortfolio({
                ...portfolio,
                cash: portfolio.cash.filter((_, i) => i !== index),
              })
            }
          >
            <div className="min-w-0 flex-1">
              <input
                className="ledger-input ledger-input-left w-full"
                placeholder="Account name"
                value={item.name}
                onChange={(e) => updateCash(index, { name: e.target.value })}
              />
            </div>
            <OwnerSelect
              value={item.owner}
              onChange={(owner) => updateCash(index, { owner })}
            />
            <div className="w-36 shrink-0">
              <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                Balance
              </p>
              {numInput(item.balance, (balance) =>
                updateCash(index, { balance }),
              )}
            </div>
          </LedgerRow>
        ))}
      </LedgerSection>

      <LedgerSection
        title={`Super (${portfolio.super.length} fund${portfolio.super.length === 1 ? "" : "s"})`}
        onAdd={() =>
          setPortfolio({
            ...portfolio,
            super: [
              ...portfolio.super,
              {
                id: newId("super"),
                name: "",
                balance: 0,
                owner: "Felix" as Owner,
              },
            ],
          })
        }
      >
        {portfolio.super.map((item, index) => (
          <LedgerRow
            key={item.id}
            onRemove={() =>
              setPortfolio({
                ...portfolio,
                super: portfolio.super.filter((_, i) => i !== index),
              })
            }
          >
            <div className="min-w-0 flex-1">
              <input
                className="ledger-input ledger-input-left w-full"
                placeholder="Fund name"
                value={item.name}
                onChange={(e) => updateSuper(index, { name: e.target.value })}
              />
            </div>
            <OwnerSelect
              value={item.owner}
              onChange={(owner) => updateSuper(index, { owner })}
            />
            <div className="w-36 shrink-0">
              <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                Balance
              </p>
              {numInput(item.balance, (balance) =>
                updateSuper(index, { balance }),
              )}
            </div>
          </LedgerRow>
        ))}
      </LedgerSection>

      <LedgerSection
        title={`Properties (${portfolio.properties.length})`}
        onAdd={() =>
          setPortfolio({
            ...portfolio,
            properties: [
              ...portfolio.properties,
              {
                id: newId("prop"),
                name: "",
                value: 0,
                mortgage: 0,
                owner: "Felix" as Owner,
              },
            ],
          })
        }
      >
        {portfolio.properties.map((item, index) => {
          const equity = item.value - item.mortgage;
          return (
            <LedgerRow
              key={item.id}
              onRemove={() =>
                setPortfolio({
                  ...portfolio,
                  properties: portfolio.properties.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              <div className="min-w-0 flex-1">
                <input
                  className="ledger-input ledger-input-left w-full"
                  placeholder="Property name"
                  value={item.name}
                  onChange={(e) =>
                    updateProperty(index, { name: e.target.value })
                  }
                />
              </div>
              <OwnerSelect
                value={item.owner}
                onChange={(owner) => updateProperty(index, { owner })}
              />
              <div className="w-32 shrink-0">
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                  Value
                </p>
                {numInput(item.value, (value) =>
                  updateProperty(index, { value }),
                )}
              </div>
              <div className="w-32 shrink-0">
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                  Mortgage
                </p>
                {numInput(item.mortgage, (mortgage) =>
                  updateProperty(index, { mortgage }),
                )}
              </div>
              <div className="w-28 shrink-0 text-right">
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                  Equity
                </p>
                <p className="ledger-mono text-sm text-emerald-400">
                  {formatAud(equity)}
                </p>
              </div>
            </LedgerRow>
          );
        })}
      </LedgerSection>

      <LedgerSection
        title={`Shares (${portfolio.holdings.length})`}
        action={
          <button
            type="button"
            onClick={refreshQuotes}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300"
          >
            <RefreshCw
              className={refreshing ? "size-3 animate-spin" : "size-3"}
            />
            Refresh prices
          </button>
        }
        onAdd={() =>
          setPortfolio({
            ...portfolio,
            holdings: [
              ...portfolio.holdings,
              {
                id: newId("hold"),
                ticker: "",
                quantity: 0,
                owner: "Felix" as Owner,
              },
            ],
          })
        }
      >
        {portfolio.holdings.map((item, index) => {
          const { price, stale, asOf } = getHoldingPrice(item, quoteCache);
          const marketValue = price * item.quantity;
          return (
            <div key={item.id} className="space-y-2 border-b border-border/40 py-3 last:border-0">
              <LedgerRow
                onRemove={() =>
                  setPortfolio({
                    ...portfolio,
                    holdings: portfolio.holdings.filter((_, i) => i !== index),
                  })
                }
              >
                <div className="w-24 shrink-0">
                  <input
                    className="ledger-input ledger-input-left w-full text-sky-400"
                    placeholder="VAS.AX"
                    value={item.ticker}
                    onChange={(e) =>
                      updateHolding(index, {
                        ticker: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <OwnerSelect
                  value={item.owner}
                  onChange={(owner) => updateHolding(index, { owner })}
                />
                <div className="w-24 shrink-0">
                  <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                    Qty
                  </p>
                  {numInput(item.quantity, (quantity) =>
                    updateHolding(index, { quantity }),
                  )}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Price
                    {stale && " · stale"}
                  </p>
                  <p className="ledger-mono text-sm">
                    {price > 0 ? formatAud(price, true) : "—"}
                    {asOf && (
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {new Date(asOf).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Value
                  </p>
                  <p className="ledger-mono text-sm">{formatAud(marketValue)}</p>
                </div>
              </LedgerRow>
              <div className="pl-1">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Manual price override"
                  className="ledger-input ledger-input-left max-w-xs text-xs"
                  value={item.manualPrice ?? ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? undefined : Number(e.target.value);
                    updateHolding(index, { manualPrice: val });
                  }}
                />
              </div>
            </div>
          );
        })}
      </LedgerSection>

      <LedgerSection
        title={`Other debts (${portfolio.otherDebts.length})`}
        onAdd={() =>
          setPortfolio({
            ...portfolio,
            otherDebts: [
              ...portfolio.otherDebts,
              {
                id: newId("debt"),
                name: "",
                balance: 0,
                owner: "Felix" as Owner,
              },
            ],
          })
        }
      >
        {portfolio.otherDebts.map((item, index) => (
          <LedgerRow
            key={item.id}
            onRemove={() =>
              setPortfolio({
                ...portfolio,
                otherDebts: portfolio.otherDebts.filter((_, i) => i !== index),
              })
            }
          >
            <div className="min-w-0 flex-1">
              <input
                className="ledger-input ledger-input-left w-full"
                placeholder="Debt name"
                value={item.name}
                onChange={(e) => updateDebt(index, { name: e.target.value })}
              />
            </div>
            <OwnerSelect
              value={item.owner}
              onChange={(owner) => updateDebt(index, { owner })}
            />
            <div className="w-36 shrink-0">
              <p className="mb-1 text-[10px] uppercase text-muted-foreground">
                Balance owing
              </p>
              {numInput(item.balance, (balance) =>
                updateDebt(index, { balance }),
              )}
            </div>
          </LedgerRow>
        ))}
      </LedgerSection>

      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Replace {formatMonthKey(monthKey)} snapshot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A snapshot for this month already exists. Replacing it will
              overwrite the frozen copy with your current numbers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReplaceOpen(false);
                saveSnapshot(true);
              }}
            >
              Replace snapshot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LedgerSection({
  title,
  children,
  onAdd,
  action,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <section className="ledger-panel overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
        <h2 className="ledger-section-title">{title}</h2>
        <div className="flex items-center gap-3">
          {action}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
      <div className="px-4 py-1">{children}</div>
    </section>
  );
}

function LedgerRow({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border/30 py-3 last:border-0">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="mb-0.5 text-muted-foreground hover:text-red-400"
        aria-label="Remove row"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
