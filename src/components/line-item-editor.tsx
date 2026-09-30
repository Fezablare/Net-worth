"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  step?: string;
}

interface LineItemEditorProps<T extends { id: string }> {
  title: string;
  items: T[];
  fields: Field[];
  onChange: (items: T[]) => void;
  onAdd: () => T;
  maxItems?: number;
  extra?: (item: T, index: number) => React.ReactNode;
}

export function LineItemEditor<T extends { id: string }>({
  title,
  items,
  fields,
  onChange,
  onAdd,
  maxItems,
  extra,
}: LineItemEditorProps<T>) {
  function updateItem(index: number, key: string, value: string | number) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {(!maxItems || items.length < maxItems) && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, onAdd()])}>
            Add
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={`${item.id}-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`${item.id}-${field.key}`}
                      type={field.type ?? "text"}
                      step={field.step}
                      placeholder={field.placeholder}
                      value={String((item as Record<string, unknown>)[field.key] ?? "")}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const value =
                          field.type === "number"
                            ? raw === "" ? 0 : Number(raw)
                            : raw;
                        updateItem(index, field.key, value);
                      }}
                    />
                  </div>
                ))}
              </div>
              {extra?.(item, index)}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
