import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { IndustryCategory } from "@/lib/categories/industryCategories";

type Props = {
  category: IndustryCategory;
  clientName?: string;
  compact?: boolean;
};

export function CategoryDashboardBanner({ category, clientName, compact }: Props) {
  const Icon = category.icon as LucideIcon;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          {category.tag}
        </Badge>
        <span className="text-xs text-muted-foreground">{category.name}</span>
        {clientName ? (
          <span className="text-xs font-medium text-foreground">· {clientName}</span>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="border-border/80 bg-card/80">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{category.name}</h2>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {category.tag}
            </Badge>
            {clientName ? (
              <span className="text-xs text-muted-foreground">
                Client: <span className="font-medium text-foreground">{clientName}</span>
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Core metric:</span> {category.coreMetric}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Dashboard focus:</span>{" "}
            {category.dashboardFocus}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
