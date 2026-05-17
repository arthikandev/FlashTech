import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";
import { DashboardProvider } from "@/dashboard/context/DashboardContext";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useTenant } from "@/tenant/TenantContext";
import { clerkEnabled } from "@/convex/api";
import { getCategoryDashboardDef } from "./categoryDashboardRegistry";
import { CategorySidebarNav } from "./CategorySidebarNav";
import { CategoryTopKpiRow } from "./CategoryTopKpiRow";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function CategoryClientDashboardShell({ children }: Props) {
  const { business, embedKey } = useTenant();
  const { client } = useCurrentClient();
  const category = useBusinessCategory();
  const def = getCategoryDashboardDef(category.code);
  const displayName = client?.businessName ?? business?.name ?? "Your workspace";
  const badge =
    client?.verification.badgeLabel ?? category.tag;

  return (
    <DashboardProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">{displayName}</h1>
            <Badge variant="secondary" className="mt-1">
              {badge}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/canvas/settings?embedKey=${encodeURIComponent(embedKey)}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Profile
            </Link>
            {clerkEnabled ? <UserButton afterSignOutUrl="/login" /> : null}
          </div>
        </header>

        <div className="px-4 py-4 lg:px-6">
          <CategoryTopKpiRow kpis={def.topKpis} />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <CategorySidebarNav def={def} embedKey={embedKey} />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 lg:px-6 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
