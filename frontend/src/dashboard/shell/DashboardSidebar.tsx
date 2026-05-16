import { UserButton } from "@clerk/clerk-react";
import { Link, NavLink } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { DASHBOARD_NAV } from "./navConfig";

type Props = {
  workspaceLabel: string;
  onNavigate?: () => void;
};

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "dash-nav-active dash-nav-item" : "dash-nav-item";
}

export function DashboardSidebar({ workspaceLabel, onNavigate }: Props) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-dash-border bg-dash-sidebar">
      <div className="border-b border-dash-border px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-dash-ink"
          onClick={onNavigate}
        >
          PresenceIQ
          <span className="live-dot" aria-hidden />
        </Link>
        <p className="mt-2 truncate text-xs text-dash-muted">{workspaceLabel}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Dashboard">
        {DASHBOARD_NAV.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 dash-label">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.end}
                    className={navClass}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-dash-border p-4">
        <div className="dash-card p-3">
          <div className="flex items-center gap-3">
            {clerkEnabled ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-accent/20 text-xs font-bold text-dash-accent">
                PIQ
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-dash-ink">{workspaceLabel}</p>
              <p className="text-[10px] text-dash-muted">AI active</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
