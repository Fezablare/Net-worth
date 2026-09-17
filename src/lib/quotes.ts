import YahooFinance from "yahoo-finance2";
import type { QuoteCache, QuoteInfo } from "./types";

const yahooFinance = new YahooFinance();

function normalizeTicker(ticker: string): string {
  const upper = ticker.trim().toUpperCase();
  if (!upper.endsWith(".AX")) {
    return `${upper}.AX`;
  }
  return upper;
}

export async function fetchQuotes(
  tickers: string[],
  existingCache: QuoteCache,
): Promise<QuoteCache> {
  const normalized = [...new Set(tickers.map(normalizeTicker))].filter(Boolean);
  const result: QuoteCache = { ...existingCache };

  if (normalized.length === 0) return result;

  try {
    const quotes = await yahooFinance.quote(normalized);
    const list = Array.isArray(quotes) ? quotes : [quotes];

    for (const quote of list) {
      const symbol = quote.symbol?.toUpperCase();
      if (!symbol) continue;

      const price =
        quote.regularMarketPrice ??
        quote.postMarketPrice ??
        quote.preMarketPrice;

      if (price == null || !Number.isFinite(price)) continue;

      const asOf =
        quote.regularMarketTime?.toISOString() ??
        quote.postMarketTime?.toISOString() ??
        new Date().toISOString();

      result[symbol] = { price, asOf, stale: false };
    }

    for (const ticker of normalized) {
      if (!result[ticker] && existingCache[ticker]) {
        result[ticker] = { ...existingCache[ticker], stale: true };
      }
    }
  } catch {
    for (const ticker of normalized) {
      if (existingCache[ticker]) {
        result[ticker] = { ...existingCache[ticker], stale: true };
      }
    }
  }

  return result;
}

export function applyManualPrices(
  cache: QuoteCache,
  manual: Record<string, number>,
): QuoteCache {
  const updated = { ...cache };
  for (const [ticker, price] of Object.entries(manual)) {
    const key = ticker.toUpperCase();
    if (price > 0) {
      updated[key] = {
        price,
        asOf: new Date().toISOString(),
        stale: true,
      };
    }
  }
  return updated;
}
