import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrialCohort() {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.categoryStats.saasTrialCohort,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Trial cohort × pricing-page hits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rows.map((row) => {
              const conv =
                row.visitors > 0
                  ? Math.round((row.pricingViews / row.visitors) * 100)
                  : 0;
              return (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.visitors} visitors · {row.pricingViews} viewed pricing
                    </p>
                  </div>
                  <span className="tabular-nums text-xs font-medium text-foreground">
                    {conv}% pricing-curious
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
