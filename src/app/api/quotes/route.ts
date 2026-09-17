import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { isAuthenticated } from "@/lib/auth";
import { fetchQuotes } from "@/lib/quotes";
import { readData, writeData } from "@/lib/store";

export async function POST(request: Request) {
  const authError = !(await isAuthenticated())
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : null;
  if (authError) return authError;

  const body = await request.json();
  const tickers = Array.isArray(body.tickers) ? body.tickers : [];
  const manualPrices =
    body.manualPrices && typeof body.manualPrices === "object"
      ? body.manualPrices
      : {};

  const data = await readData();
  let quoteCache = await fetchQuotes(tickers, data.quoteCache);

  for (const [ticker, price] of Object.entries(manualPrices)) {
    const key = ticker.toUpperCase();
    const num = Number(price);
    if (num > 0) {
      quoteCache[key] = {
        price: num,
        asOf: new Date().toISOString(),
        stale: true,
      };
    }
  }

  data.quoteCache = quoteCache;
  await writeData(data);

  return NextResponse.json({ quotes: quoteCache });
}
