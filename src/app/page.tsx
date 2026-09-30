"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { AllocationChart } from "@/components/allocation-chart";
import { AppShell } from "@/components/app-shell";
import { DashboardChart } from "@/components/dashboard-chart";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { OwnerTotalsBanner } from "@/components/owner-totals-banner";
import { useData } from "@/hooks/use-data";
import {
  computeAllocation,
  computeTotals,
  getHoldingPrice,
  monthOverMonthChange,
} from "@/lib/calculations";
import { formatAud, formatChange, formatMonthKey } from "@/lib/format";

export default function DashboardPage() {
  const { data, loading, error, refresh } = useData();

  if (loading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <ErrorState message={error ?? "Failed to load"} onRetry={refresh} />
      </AppShell>
    );
  }

  const liveTotals = computeTotals(data.portfolio, data.quoteCache);
  const sortedSnapshots = [...data.snapshots].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
  const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
  const momChange = monthOverMonthChange(data.snapshots);
  const displayTotals = latestSnapshot?.totals ?? liveTotals;
  const displayOwners = displayTotals.owners ?? liveTotals.owners;
  const allocation = computeAllocation(displayTotals);
  const portfolio = latestSnapshot?.portfolio ?? data.portfolio;
  const quotes = latestSnapshot?.quotes ?? data.quoteCache;

  const asOf = latestSnapshot
    ? new Date(latestSnapshot.savedAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Live draft";

  if (data.snapshots.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Live household net worth from your current numbers.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">As of {asOf}</p>
          </div>
          <div className="ledger-panel p-6">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Net worth (draft)
            </p>
            <p className="ledger-mono mt-1 text-4xl">
              {formatAud(liveTotals.netWorth)}
            </p>
            <OwnerTotalsBanner owners={liveTotals.owners} />
          </div>
          <EmptyState
            title="No snapshots yet"
            description="Save your first monthly snapshot from This month to start tracking history."
            actionLabel="Go to This month"
            actionHref="/this-month"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Household view
              {latestSnapshot
                ? ` · latest snapshot ${formatMonthKey(latestSnapshot.monthKey)}`
                : ""}
            </p>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">As of {asOf}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Net worth" value={formatAud(displayTotals.netWorth)} large>
            {momChange != null && (
              <span
                className={`mt-1 inline-flex items-center gap-1 text-xs ${
                  momChange >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {momChange >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {formatChange(momChange)} mtd
              </span>
            )}
          </SummaryCard>
          <SummaryCard
            label="Cash"
            value={formatAud(displayTotals.cash)}
            hint={portfolio.cash[0]?.name}
          />
          <SummaryCard
            label="Super"
            value={formatAud(displayTotals.super)}
            hint={`${portfolio.super.length} fund${portfolio.super.length === 1 ? "" : "s"}`}
          />
          <SummaryCard
            label="Property equity"
            value={formatAud(displayTotals.propertyEquity)}
            hint={`${portfolio.properties.length} properties`}
          />
          <SummaryCard
            label="Debts"
            value={`−${formatAud(displayTotals.otherDebts)}`}
            valueClass="text-red-400"
            hint={portfolio.otherDebts[0]?.name}
          />
        </div>

        <div className="ledger-panel p-5">
          <p className="ledger-section-title mb-3">By owner</p>
          <OwnerTotalsBanner owners={displayOwners} compact />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="ledger-panel p-4">
              <h2 className="ledger-section-title mb-4">Holdings · Shares</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-muted-foreground">
                    <th className="pb-2">Ticker</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Value</th>
                    <th className="pb-2 text-right">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h) => {
                    const { price } = getHoldingPrice(h, quotes);
                    const value = price * h.quantity;
                    return (
                      <tr key={h.id} className="border-t border-border/40">
                        <td className="py-2 text-sky-400">{h.ticker}</td>
                        <td className="ledger-mono py-2 text-right">{h.quantity}</td>
                        <td className="ledger-mono py-2 text-right">
                          {formatAud(price, true)}
                        </td>
                        <td className="ledger-mono py-2 text-right">
                          {formatAud(value)}
                        </td>
                        <td className="py-2 text-right text-xs">{h.owner}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ledger-panel p-4">
              <h2 className="ledger-section-title mb-4">
                Properties · Equity after mortgage
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-muted-foreground">
                    <th className="pb-2">Property</th>
                    <th className="pb-2 text-right">Value</th>
                    <th className="pb-2 text-right">Mortgage</th>
                    <th className="pb-2 text-right">Owner</th>
                    <th className="pb-2 text-right">Equity</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.properties.map((p) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="py-2">{p.name}</td>
                      <td className="ledger-mono py-2 text-right">
                        {formatAud(p.value)}
                      </td>
                      <td className="ledger-mono py-2 text-right">
                        {formatAud(p.mortgage)}
                      </td>
                      <td className="py-2 text-right text-xs">{p.owner}</td>
                      <td className="ledger-mono py-2 text-right text-emerald-400">
                        {formatAud(p.value - p.mortgage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="ledger-panel p-4">
              <h2 className="ledger-section-title mb-4">Net worth · trend</h2>
              <DashboardChart snapshots={data.snapshots} />
            </div>
            <div className="ledger-panel p-4">
              <h2 className="ledger-section-title mb-4">Allocation</h2>
              <AllocationChart items={allocation} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  large,
  valueClass,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  large?: boolean;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ledger-panel p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`ledger-mono mt-1 ${large ? "text-2xl" : "text-lg"} ${valueClass ?? ""}`}
      >
        {value}
      </p>
      {children}
      {hint && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
