import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { isAuthenticated } from "@/lib/auth";
import { readData, writeData } from "@/lib/store";
import type { AppData } from "@/lib/types";

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
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = (await request.json()) as Partial<AppData>;
  const current = await readData();

  const updated: AppData = {
    portfolio: body.portfolio ?? current.portfolio,
    snapshots: body.snapshots ?? current.snapshots,
    quoteCache: body.quoteCache ?? current.quoteCache,
  };

  await writeData(updated);
  return NextResponse.json(updated);
}
