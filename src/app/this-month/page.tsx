"use client";

import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ThisMonthEditor } from "@/components/this-month-editor";
import { useData } from "@/hooks/use-data";

export default function ThisMonthPage() {
  const { data, loading, error, refresh, save } = useData();

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

  return (
    <AppShell>
      <ThisMonthEditor
        data={data}
        onSave={async (next) => {
          await save(next);
        }}
      />
    </AppShell>
  );
}
