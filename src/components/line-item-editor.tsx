"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryId } from "@/lib/categories";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  step?: string;
}

interface LineItemEditorProps<T extends { id: string }> {
  title: string;
  category: CategoryId;
  items: T[];
  fields: Field[];
  onChange: (items: T[]) => void;
  onAdd: () => T;
  maxItems?: number;
  extra?: (item: T, index: number) => ReactNode;
}

export function LineItemEditor<T extends { id: string }>({
  title,
  category,
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
    <CategorySection
      category={category}
      title={title}
      action={
        (!maxItems || items.length < maxItems) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-background/80"
            onClick={() => onChange([...items, onAdd()])}
          >
            Add
          </Button>
        )
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-xl border border-border/70 bg-background/85 p-4"
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
    </CategorySection>
  );
}
