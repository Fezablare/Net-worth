"use client";

import { useState } from "react";
import { ChevronDown, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
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
import { useData } from "@/hooks/use-data";
import { getHoldingPrice, snapshotChange } from "@/lib/calculations";
import { formatAud, formatChange, formatMonthKey } from "@/lib/format";
import type { Snapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { data, loading, error, refresh } = useData();
  const [deleteTarget, setDeleteTarget] = useState<Snapshot | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleDelete(monthKey: string) {
    const res = await fetch("/api/snapshots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthKey }),
    });
    if (!res.ok) {
      toast.error("Could not delete snapshot");
      return;
    }
    toast.success("Snapshot deleted");
    refresh();
  }

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

  const snapshots = [...data.snapshots].sort((a, b) =>
    b.monthKey.localeCompare(a.monthKey),
  );

  const rangeLabel =
    snapshots.length > 0
      ? `${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"}`
      : "";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly snapshots · each one is frozen the moment it&apos;s saved
            </p>
          </div>
          {rangeLabel && (
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          )}
        </div>

        {snapshots.length === 0 ? (
          <EmptyState
            title="No snapshots saved"
            description="When you save a monthly snapshot from This month, it will appear here with locked line items."
            actionLabel="Edit this month"
            actionHref="/this-month"
          />
        ) : (
          <div className="ledger-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <span className="ledger-section-title">Snapshots</span>
              <span className="text-xs text-muted-foreground">newest first</span>
            </div>
            <ul>
              {snapshots.map((snapshot) => {
                const isOpen = expanded === snapshot.monthKey;
                const change = snapshotChange(data.snapshots, snapshot.monthKey);
                const savedLabel = new Date(snapshot.savedAt).toLocaleString(
                  "en-AU",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  },
                );

                return (
                  <li
                    key={snapshot.monthKey}
                    className="border-b border-border/40 last:border-0"
                  >
                    <div className="flex w-full items-center gap-3 px-4 py-4 hover:bg-muted/20">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() =>
                          setExpanded(isOpen ? null : snapshot.monthKey)
                        }
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {formatMonthKey(snapshot.monthKey)}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-400/90">
                            <Lock className="size-3" />
                            Frozen · saved {savedLabel}
                          </p>
                        </div>
                        {change != null && (
                          <span
                            className={`ledger-mono text-sm ${
                              change >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {formatChange(change)}
                          </span>
                        )}
                        <span className="ledger-mono text-lg font-medium">
                          {formatAud(snapshot.totals.netWorth)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(snapshot)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-red-400"
                        aria-label="Delete snapshot"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {isOpen && (
                      <SnapshotDetail snapshot={snapshot} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteTarget ? formatMonthKey(deleteTarget.monthKey) : ""}{" "}
              snapshot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the frozen monthly copy. Your current draft numbers
              are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget.monthKey);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function SnapshotDetail({ snapshot }: { snapshot: Snapshot }) {
  const { portfolio, quotes, totals } = snapshot;
  const owners = totals.owners;

  const lines: { category: string; name: string; owner: string; amount: number }[] =
    [];

  for (const a of portfolio.cash) {
    lines.push({ category: "Cash", name: a.name, owner: a.owner, amount: a.balance });
  }
  for (const s of portfolio.super) {
    lines.push({ category: "Super", name: s.name, owner: s.owner, amount: s.balance });
  }
  for (const p of portfolio.properties) {
    lines.push({
      category: "Property",
      name: p.name,
      owner: p.owner,
      amount: p.value - p.mortgage,
    });
  }
  for (const h of portfolio.holdings) {
    const { price } = getHoldingPrice(h, quotes);
    lines.push({
      category: "Shares",
      name: h.ticker,
      owner: h.owner,
      amount: price * h.quantity,
    });
  }
  for (const d of portfolio.otherDebts) {
    lines.push({
      category: "Debt",
      name: d.name,
      owner: d.owner,
      amount: -d.balance,
    });
  }

  return (
    <div className="border-t border-border/40 bg-muted/10 px-4 py-4">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Cash", value: totals.cash },
          { label: "Super", value: totals.super },
          { label: "Property equity", value: totals.propertyEquity },
          { label: "Shares", value: totals.shares },
          {
            label: "Debts",
            value: -totals.otherDebts,
            negative: true,
          },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] uppercase text-muted-foreground">
              {item.label}
            </p>
            <p
              className={`ledger-mono text-sm ${
                item.negative ? "text-red-400" : ""
              }`}
            >
              {formatAud(item.value)}
            </p>
          </div>
        ))}
      </div>

      {owners && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <p>Felix <span className="ledger-mono">{formatAud(owners.felix)}</span></p>
          <p>Kaki <span className="ledger-mono">{formatAud(owners.kaki)}</span></p>
          <p>Joint <span className="ledger-mono">{formatAud(owners.joint)}</span></p>
          <p>Household <span className="ledger-mono text-emerald-400">{formatAud(owners.household)}</span></p>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase text-muted-foreground">
            <th className="pb-2">Type</th>
            <th className="pb-2">Name</th>
            <th className="pb-2">Owner</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="border-t border-border/30">
              <td className="py-1.5 text-muted-foreground">{line.category}</td>
              <td className="py-1.5">{line.name}</td>
              <td className="py-1.5 text-xs">{line.owner}</td>
              <td
                className={`ledger-mono py-1.5 text-right ${
                  line.amount < 0 ? "text-red-400" : ""
                }`}
              >
                {formatAud(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 flex items-start gap-2 text-xs text-amber-400/80">
        <Lock className="mt-0.5 size-3 shrink-0" />
        This snapshot is locked. Editing accounts today won&apos;t change these
        saved figures — only the current month draft.
      </p>
    </div>
  );
}
