export type CategoryId = "cash" | "super" | "property" | "shares" | "debt";

export interface CategoryTheme {
  id: CategoryId;
  label: string;
  cssVar: `--cat-${CategoryId}`;
}

export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  cash: { id: "cash", label: "Cash", cssVar: "--cat-cash" },
  super: { id: "super", label: "Super", cssVar: "--cat-super" },
  property: { id: "property", label: "Property", cssVar: "--cat-property" },
  shares: { id: "shares", label: "Shares", cssVar: "--cat-shares" },
  debt: { id: "debt", label: "Other debts", cssVar: "--cat-debt" },
};

export const CATEGORY_SECTION_STYLES: Record<
  CategoryId,
  { wrap: string; header: string; title: string; dot: string }
> = {
  cash: {
    wrap: "border-cat-cash/30 bg-cat-cash/10 border-l-cat-cash",
    header: "bg-cat-cash/15",
    title: "text-cat-cash",
    dot: "bg-cat-cash",
  },
  super: {
    wrap: "border-cat-super/30 bg-cat-super/10 border-l-cat-super",
    header: "bg-cat-super/15",
    title: "text-cat-super",
    dot: "bg-cat-super",
  },
  property: {
    wrap: "border-cat-property/30 bg-cat-property/10 border-l-cat-property",
    header: "bg-cat-property/15",
    title: "text-cat-property",
    dot: "bg-cat-property",
  },
  shares: {
    wrap: "border-cat-shares/30 bg-cat-shares/10 border-l-cat-shares",
    header: "bg-cat-shares/15",
    title: "text-cat-shares",
    dot: "bg-cat-shares",
  },
  debt: {
    wrap: "border-cat-debt/30 bg-cat-debt/10 border-l-cat-debt",
    header: "bg-cat-debt/15",
    title: "text-cat-debt",
    dot: "bg-cat-debt",
  },
};

export function categoryColor(id: CategoryId): string {
  return `var(${CATEGORY_THEMES[id].cssVar})`;
}
