import { UserButton } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { CategoryDefinition } from "@/lib/categories";
import { clerkEnabled } from "@/convex/api";
import { KpiCard } from "./KpiCard";

type Props = {
  category: CategoryDefinition;
  businessName: string;
  children: ReactNode;
};

export function CategoryDashboardLayout({ category, businessName, children }: Props) {
  return (
    <div className="dark dash-theme flex min-h-[100dvh] bg-dash-bg text-dash-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-dash-border bg-dash-sidebar lg:flex">
        <div className="border-b border-dash-border px-5 py-5">
          <Link to="/" className="font-serif text-lg text-primary">
            PresenceIQ
          </Link>
          <p className="mt-1 text-xs text-dash-muted">{category.name}</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {category.navItems.map((item, i) => (
            <span
              key={item}
              className={`block rounded-lg px-3 py-2 text-sm ${
                i === 0
                  ? "bg-dash-active font-medium text-dash-ink"
                  : "text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-dash-border bg-dash-surface px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{businessName}</h1>
            <p className="text-xs text-dash-muted">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                Verified
              </span>
              <span className="ml-2">{category.tag}</span>
            </p>
          </div>
          {clerkEnabled ? (
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.mockKpis.map((kpi) => (
              <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
