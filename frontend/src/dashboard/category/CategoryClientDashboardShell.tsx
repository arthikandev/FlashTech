import { Badge } from "@/components/ui/badge";
import { DashboardProvider } from "@/dashboard/context/DashboardContext";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useTenant } from "@/tenant/TenantContext";
import { getCategoryDashboardDef } from "./categoryDashboardRegistry";
import { CategoryDashboardTabs } from "./CategoryDashboardTabs";
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
  const badge = client?.verification.badgeLabel ?? category.tag;

  return (
    <DashboardProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card/50 px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-foreground">{displayName}</h1>
            <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
              {badge}
            </Badge>
          </div>
          <div className="mt-3">
            <CategoryTopKpiRow kpis={def.topKpis} compact />
          </div>
          <div className="mt-3">
            <CategoryDashboardTabs def={def} embedKey={embedKey} />
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-5 lg:px-6 lg:py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </DashboardProvider>
  );
}
