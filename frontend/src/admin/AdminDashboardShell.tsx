import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  CreditCard,
  FileClock,
  LayoutDashboard,
  Plug,
  Users,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/tenant/TenantContext";

type AdminSection = {
  slug: string;
  label: string;
  icon: typeof Activity;
};

const SECTIONS: AdminSection[] = [
  { slug: "overview", label: "Overview", icon: LayoutDashboard },
  { slug: "team", label: "Team & Roles", icon: Users },
  { slug: "billing", label: "Billing & Usage", icon: CreditCard },
  { slug: "integrations", label: "Integrations", icon: Plug },
  { slug: "embed", label: "Embed & Avatar", icon: Code2 },
  { slug: "audit", label: "Audit Log", icon: FileClock },
];

export function AdminDashboardShell() {
  const { embedKey, workspaceLabel } = useTenant();
  const location = useLocation();
  const qs = embedKey ? `?embedKey=${encodeURIComponent(embedKey)}` : "";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace Admin
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              {workspaceLabel}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Activity className="size-3.5" aria-hidden />
            <span>Platform controls</span>
          </div>
        </header>

        <nav className="-mx-1 flex flex-wrap gap-1 border-b border-border pb-2">
          {SECTIONS.map((section) => {
            const to = `/canvas/admin/${section.slug}${qs}`;
            const active =
              location.pathname === `/canvas/admin/${section.slug}` ||
              (section.slug === "overview" &&
                (location.pathname === "/canvas/admin" ||
                  location.pathname === "/canvas/admin/"));
            const Icon = section.icon;
            return (
              <NavLink
                key={section.slug}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/12 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span>{section.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
