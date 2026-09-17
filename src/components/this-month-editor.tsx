"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Save } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { HoldingsEditor } from "@/components/holdings-editor";
import { LineItemEditor } from "@/components/line-item-editor";
import { NetWorthBar } from "@/components/net-worth-bar";
import { computeTotals } from "@/lib/calculations";
import { currentMonthKey, formatMonthKey } from "@/lib/format";
import type { AppData, Portfolio } from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
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

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">This month</h2>
          <p className="text-sm text-muted-foreground">
            Update balances for {formatMonthKey(monthKey)}. Share prices refresh from Yahoo Finance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshQuotes} disabled={refreshing}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
            Refresh prices
          </Button>
          <Button onClick={() => saveSnapshot(false)} disabled={saving}>
            <Save className="size-4" />
            Save snapshot
          </Button>
        </div>
      </div>

      {existingSnapshot && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          A snapshot already exists for this month. Saving again will ask you to confirm replacement.
        </p>
      )}

      <LineItemEditor
        title="Cash accounts"
        category="cash"
        items={portfolio.cash}
        fields={[
          { key: "name", label: "Account name" },
          { key: "balance", label: "Balance (AUD)", type: "number" },
          { key: "ownershipPercent", label: "Ownership %", type: "number", step: "1" },
        ]}
        onChange={(cash) => setPortfolio({ ...portfolio, cash })}
        onAdd={() => ({
          id: newId("cash"),
          name: "",
          balance: 0,
          ownershipPercent: 100,
        })}
      />

      <LineItemEditor
        title="Super funds"
        category="super"
        items={portfolio.super}
        fields={[
          { key: "name", label: "Fund name" },
          { key: "balance", label: "Balance (AUD)", type: "number" },
          { key: "ownershipPercent", label: "Ownership %", type: "number", step: "1" },
        ]}
        onChange={(superFunds) => setPortfolio({ ...portfolio, super: superFunds })}
        onAdd={() => ({
          id: newId("super"),
          name: "",
          balance: 0,
          ownershipPercent: 100,
        })}
      />

      <LineItemEditor
        title="Properties"
        category="property"
        items={portfolio.properties}
        maxItems={3}
        fields={[
          { key: "name", label: "Property name" },
          { key: "value", label: "Current value (AUD)", type: "number" },
          { key: "mortgage", label: "Mortgage balance (AUD)", type: "number" },
          { key: "ownershipPercent", label: "Ownership %", type: "number", step: "1" },
        ]}
        onChange={(properties) => setPortfolio({ ...portfolio, properties })}
        onAdd={() => ({
          id: newId("prop"),
          name: "",
          value: 0,
          mortgage: 0,
          ownershipPercent: 100,
        })}
      />

      <HoldingsEditor
        holdings={portfolio.holdings}
        quoteCache={quoteCache}
        onChange={(holdings) => setPortfolio({ ...portfolio, holdings })}
        onAdd={() => ({
          id: newId("hold"),
          ticker: "",
          quantity: 0,
          ownershipPercent: 100,
        })}
      />

      <LineItemEditor
        title="Other debts"
        category="debt"
        items={portfolio.otherDebts}
        fields={[
          { key: "name", label: "Debt name" },
          { key: "balance", label: "Balance (AUD)", type: "number" },
          { key: "ownershipPercent", label: "Ownership %", type: "number", step: "1" },
        ]}
        onChange={(otherDebts) => setPortfolio({ ...portfolio, otherDebts })}
        onAdd={() => ({
          id: newId("debt"),
          name: "",
          balance: 0,
          ownershipPercent: 100,
        })}
      />

      <div className="flex justify-end">
        <Button variant="secondary" onClick={persistPortfolio}>
          Save draft
        </Button>
      </div>

      <NetWorthBar netWorth={totals.netWorth} label="Running net worth" />

      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace {formatMonthKey(monthKey)} snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              A snapshot for this month already exists. Replacing it will overwrite the frozen copy with your current numbers.
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
