import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_SECTION_STYLES,
  type CategoryId,
} from "@/lib/categories";

interface CategorySectionProps {
  category: CategoryId;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function CategorySection({
  category,
  title,
  action,
  children,
  contentClassName,
}: CategorySectionProps) {
  const styles = CATEGORY_SECTION_STYLES[category];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-l-4",
        styles.wrap,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-3",
          styles.header,
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("size-2.5 shrink-0 rounded-full", styles.dot)} />
          <h3 className={cn("text-base font-semibold", styles.title)}>{title}</h3>
        </div>
        {action}
      </div>
      <div className={cn("space-y-3 p-4", contentClassName)}>{children}</div>
    </section>
  );
}
