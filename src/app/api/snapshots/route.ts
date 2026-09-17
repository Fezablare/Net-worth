import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { computeTotals } from "@/lib/calculations";
import { currentMonthKey } from "@/lib/format";
import { isAuthenticated } from "@/lib/auth";
import { readData, writeData } from "@/lib/store";
import type { Snapshot } from "@/lib/types";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const data = await readData();
  const snapshots = [...data.snapshots].sort((a, b) =>
    b.monthKey.localeCompare(a.monthKey),
  );
  return NextResponse.json({ snapshots });
}

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const monthKey = body.monthKey ?? currentMonthKey();
  const replace = Boolean(body.replace);

  const data = await readData();
  const existingIndex = data.snapshots.findIndex((s) => s.monthKey === monthKey);

  if (existingIndex >= 0 && !replace) {
    return NextResponse.json(
      { error: "Snapshot already exists for this month", exists: true },
      { status: 409 },
    );
  }

  const totals = computeTotals(data.portfolio, data.quoteCache);
  const snapshot: Snapshot = {
    monthKey,
    savedAt: new Date().toISOString(),
    totals,
    portfolio: JSON.parse(JSON.stringify(data.portfolio)),
    quotes: { ...data.quoteCache },
  };

  if (existingIndex >= 0) {
    data.snapshots[existingIndex] = snapshot;
  } else {
    data.snapshots.push(snapshot);
  }

  await writeData(data);
  return NextResponse.json({ snapshot });
}

export async function DELETE(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { monthKey } = await request.json();
  if (!monthKey) {
    return NextResponse.json({ error: "monthKey required" }, { status: 400 });
  }

  const data = await readData();
  data.snapshots = data.snapshots.filter((s) => s.monthKey !== monthKey);
  await writeData(data);

  return NextResponse.json({ ok: true });
}
