import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { isAuthenticated } from "@/lib/auth";
import { readData, writeData } from "@/lib/store";
import type { AppData } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await readData();
  return NextResponse.json(data, {
    headers: {
      "Content-Disposition": `attachment; filename="net-worth-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AppData;

  if (!body.portfolio || !Array.isArray(body.snapshots)) {
    return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
  }

  const data: AppData = {
    portfolio: body.portfolio,
    snapshots: body.snapshots ?? [],
    quoteCache: body.quoteCache ?? {},
  };

  await writeData(data);
  return NextResponse.json(data);
}
