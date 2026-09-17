"use client";

import { Trash2 } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getHoldingPrice } from "@/lib/calculations";
import { formatAud } from "@/lib/format";
import type { Holding, QuoteCache } from "@/lib/types";

interface HoldingsEditorProps {
  holdings: Holding[];
  quoteCache: QuoteCache;
  onChange: (holdings: Holding[]) => void;
  onAdd: () => Holding;
}

function parseNumber(raw: string): number {
  if (raw === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export function HoldingsEditor({
  holdings,
  quoteCache,
  onChange,
  onAdd,
}: HoldingsEditorProps) {
  function updateHolding(id: string, patch: Partial<Holding>) {
    onChange(holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function removeHolding(id: string) {
    onChange(holdings.filter((h) => h.id !== id));
  }

  const totalValue = holdings.reduce((sum, holding) => {
    const { price } = getHoldingPrice(holding, quoteCache);
    return sum + price * holding.quantity * (holding.ownershipPercent / 100);
  }, 0);

  return (
    <CategorySection
      category="shares"
      title="ASX holdings"
      contentClassName="space-y-0 p-0"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-background/80"
          onClick={() => onChange([...holdings, onAdd()])}
        >
          Add
        </Button>
      }
    >
      {holdings.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">No holdings yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Own %</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Your value</TableHead>
              <TableHead className="text-right">Manual $</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const { price, stale, asOf } = getHoldingPrice(holding, quoteCache);
              const marketValue = price * holding.quantity * (holding.ownershipPercent / 100);
              const name = holding.ticker || "Holding";

              return (
                <TableRow key={holding.id} className="hover:bg-background/50">
                  <TableCell className="min-w-28">
                    <Input
                      aria-label={`${name} ticker`}
                      placeholder="VAS.AX"
                      value={holding.ticker}
                      className="font-medium uppercase"
                      onChange={(e) =>
                        updateHolding(holding.id, { ticker: e.target.value.toUpperCase() })
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-20">
                    <Input
                      aria-label={`${name} quantity`}
                      type="number"
                      step="any"
                      className="text-right tabular-nums"
                      value={holding.quantity}
                      onChange={(e) =>
                        updateHolding(holding.id, { quantity: parseNumber(e.target.value) })
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-20">
                    <Input
                      aria-label={`${name} ownership percent`}
                      type="number"
                      step="1"
                      className="text-right tabular-nums"
                      value={holding.ownershipPercent}
                      onChange={(e) =>
                        updateHolding(holding.id, {
                          ownershipPercent: parseNumber(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex flex-col items-end gap-0.5"
                      title={asOf ? `as of ${new Date(asOf).toLocaleString("en-AU")}` : undefined}
                    >
                      <span className="tabular-nums">
                        {price > 0 ? formatAud(price, true) : "—"}
                      </span>
                      {stale && price > 0 && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          Stale
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatAud(marketValue)}
                  </TableCell>
                  <TableCell className="min-w-24">
                    <Input
                      aria-label={`${name} manual price override`}
                      type="number"
                      step="0.01"
                      placeholder="—"
                      className="text-right tabular-nums"
                      value={holding.manualPrice ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateHolding(holding.id, {
                          manualPrice: raw === "" ? undefined : parseNumber(raw),
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => removeHolding(holding.id)}
                      aria-label={`Remove ${name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-cat-shares/10">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="text-muted-foreground">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatAud(totalValue)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </CategorySection>
  );
}
