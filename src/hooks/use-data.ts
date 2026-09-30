"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData } from "@/lib/types";

export function useData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Failed to load data");
      const json = (await res.json()) as AppData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (next: AppData) => {
    const res = await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) throw new Error("Failed to save");
    const json = (await res.json()) as AppData;
    setData(json);
    return json;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, save, setData };
}
