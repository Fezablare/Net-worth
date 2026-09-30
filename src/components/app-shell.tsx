"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/this-month", label: "This month", index: "01" },
  { href: "/", label: "Dashboard", index: "02" },
  { href: "/history", label: "History", index: "03" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/unlock";
  }

  const now = new Date();
  const syncTime = now.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="ledger-shell flex min-h-full">
      <aside className="ledger-sidebar flex w-[220px] shrink-0 flex-col border-r border-border/60 px-4 py-6">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="ledger-logo-dot size-2.5 shrink-0 rounded-sm bg-emerald-500" />
          <span className="text-sm font-semibold tracking-[0.2em] text-foreground">
            LEDGER
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-muted/80 text-emerald-400"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {item.index}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-8 text-[11px] text-muted-foreground">
          <p>Base currency <span className="text-foreground">AUD</span></p>
          <p>Last sync <span className="font-mono text-foreground">{syncTime}</span></p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border/40 px-6 py-3 lg:hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            Lock
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
        <footer className="hidden items-center justify-end border-t border-border/40 px-10 py-3 lg:flex">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            Lock app
          </button>
        </footer>
      </div>
    </div>
  );
}
