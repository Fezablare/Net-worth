"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { AllocationChart } from "@/components/allocation-chart";
import { AppShell } from "@/components/app-shell";
import { DashboardChart } from "@/components/dashboard-chart";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/hooks/use-data";
import { computeAllocation, computeTotals, monthOverMonthChange } from "@/lib/calculations";
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
  const allocationSource = latestSnapshot?.totals ?? liveTotals;
  const allocation = computeAllocation(allocationSource);

  if (data.snapshots.length === 0) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Live net worth from your current draft numbers.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current net worth (draft)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{formatAud(liveTotals.netWorth)}</p>
            </CardContent>
          </Card>
          <EmptyState
            title="No snapshots yet"
            description="Save your first monthly snapshot from the This month screen to start tracking history and month-over-month change."
            actionLabel="Go to This month"
            actionHref="/this-month"
          />
        </div>
      </AppShell>
    );
  }

  const displayNetWorth = latestSnapshot?.totals.netWorth ?? liveTotals.netWorth;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Based on your latest snapshot
            {latestSnapshot ? ` — ${formatMonthKey(latestSnapshot.monthKey)}` : ""}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net worth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{formatAud(displayNetWorth)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Month over month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {momChange == null ? (
                <p className="text-muted-foreground">Need two snapshots</p>
              ) : (
                <div className="flex items-center gap-2">
                  {momChange >= 0 ? (
                    <TrendingUp className="size-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="size-5 text-red-600" />
                  )}
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatChange(momChange)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Net worth over time</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart snapshots={data.snapshots} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart items={allocation} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between rounded-lg bg-cat-cash/10 px-3 py-2">
                <dt className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cat-cash" />
                  Cash
                </dt>
                <dd className="font-medium tabular-nums">{formatAud(allocationSource.cash)}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-cat-super/10 px-3 py-2">
                <dt className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cat-super" />
                  Super
                </dt>
                <dd className="font-medium tabular-nums">{formatAud(allocationSource.super)}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-cat-property/10 px-3 py-2">
                <dt className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cat-property" />
                  Property equity
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatAud(allocationSource.propertyEquity)}
                </dd>
              </div>
              <div className="flex justify-between rounded-lg bg-cat-shares/10 px-3 py-2">
                <dt className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cat-shares" />
                  Shares
                </dt>
                <dd className="font-medium tabular-nums">{formatAud(allocationSource.shares)}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-cat-debt/10 px-3 py-2 sm:col-span-2">
                <dt className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cat-debt" />
                  Other debts
                </dt>
                <dd className="font-medium tabular-nums text-cat-debt">
                  −{formatAud(allocationSource.otherDebts)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
