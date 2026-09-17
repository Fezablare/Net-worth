"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData } from "@/hooks/use-data";
import { formatAud, formatMonthKey } from "@/lib/format";
import type { Snapshot } from "@/lib/types";

export default function HistoryPage() {
  const { data, loading, error, refresh } = useData();
  const [deleteTarget, setDeleteTarget] = useState<Snapshot | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleExport() {
    const res = await fetch("/api/export");
    if (!res.ok) {
      toast.error("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `net-worth-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error("Import failed");
      toast.success("Backup restored");
      refresh();
    } catch {
      toast.error("Invalid backup file");
    }
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

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">History</h2>
            <p className="text-sm text-muted-foreground">
              Monthly snapshots and JSON backup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {snapshots.length === 0 ? (
          <EmptyState
            title="No snapshots saved"
            description="When you save a monthly snapshot from This month, it will appear here with a frozen breakdown."
            actionLabel="Edit this month"
            actionHref="/this-month"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Snapshots</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Net worth</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Cash</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Property</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Shares</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.map((snapshot) => (
                    <TableRow key={snapshot.monthKey}>
                      <TableCell className="font-medium">
                        {formatMonthKey(snapshot.monthKey)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAud(snapshot.totals.netWorth)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums">
                        {formatAud(snapshot.totals.cash)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right tabular-nums">
                        {formatAud(snapshot.totals.propertyEquity)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right tabular-nums">
                        {formatAud(snapshot.totals.shares)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(snapshot)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget ? formatMonthKey(deleteTarget.monthKey) : ""} snapshot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the frozen monthly copy. Your current draft numbers are not affected.
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
