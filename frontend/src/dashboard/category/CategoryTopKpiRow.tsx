import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeKpiSnapshot } from "@/lib/dashboard/metrics";
import { useDashboardContext } from "@/dashboard/context/DashboardContext";
import type { CategoryTopKpi } from "@/lib/categories/industryCategories";

type Props = {
  kpis: CategoryTopKpi[];
};

/** Three headline KPI cards per category wireframe; values derived from live stats where possible. */
export function CategoryTopKpiRow({ kpis }: Props) {
  const { sessions, dashboardStats } = useDashboardContext();
  const snapshot =
    dashboardStats ?? (sessions ? computeKpiSnapshot(sessions) : undefined);

  const values: Record<string, string> = snapshot
    ? {
        qualifiedLeads: String(snapshot.conversations),
        churnRisk: snapshot.hotLeadRate != null ? String(snapshot.hotLeadRate) : "—",
        upsellOps: String(Math.max(0, snapshot.liveVisitors - snapshot.conversations)),
        trialsEngaged: String(snapshot.liveVisitors),
        conversions: String(
          snapshot.conversionRate != null ? `${snapshot.conversionRate}%` : "—"
        ),
        day6Visitors: String(Math.round(snapshot.liveVisitors * 0.15)),
        bookingsToday: String(snapshot.conversations),
        avgSpeed: "3.2m",
        upsells: String(Math.round(snapshot.conversations * 0.6)),
        appointments: String(snapshot.conversations),
        multilingual: "78%",
        preBriefs: String(Math.round(snapshot.liveVisitors * 0.7)),
        cartsRecovered: String(snapshot.conversations),
        aov: "Rs.6,800",
        recsAccepted: "34%",
        screened: String(snapshot.liveVisitors),
        avgTime: "4.1m",
        qualityScore: snapshot.avgIntent != null ? `${(snapshot.avgIntent / 10).toFixed(1)}` : "—",
        liveVisitors: String(snapshot.liveVisitors),
        conversations: String(snapshot.conversations),
        conversionRate:
          snapshot.conversionRate != null ? `${snapshot.conversionRate}%` : "—",
      }
    : {};

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {kpi.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {values[kpi.key] ?? "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
