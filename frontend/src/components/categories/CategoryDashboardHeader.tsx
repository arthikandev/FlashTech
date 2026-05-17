import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/dashboard/components/DashboardPageHeader";
import type { IndustryCategory } from "@/lib/categories/industryCategories";

type Props = {
  title: string;
  category: IndustryCategory;
  clientName?: string;
};

export function CategoryDashboardHeader({ title, category, clientName }: Props) {
  return (
    <div className="space-y-3">
      <DashboardPageHeader
        title={title}
        subtitle={category.dashboardFocus}
        actions={
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {category.tag}
          </Badge>
        }
      />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{category.name}</span>
        {clientName ? (
          <>
            {" "}
            · <span className="text-foreground">{clientName}</span>
          </>
        ) : null}
        {" · "}
        {category.coreMetric}
      </p>
    </div>
  );
}
