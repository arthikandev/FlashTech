import { Card, CardContent } from "@/components/ui/card";
import { computeKpiSnapshot } from "@/lib/dashboard/metrics";
import { useDashboardContext } from "@/dashboard/context/DashboardContext";
import type { CategoryTopKpi } from "@/lib/categories/industryCategories";

type Props = {
  kpis: CategoryTopKpi[];
  compact?: boolean;
};

function buildValues(snapshot: ReturnType<typeof computeKpiSnapshot> | undefined) {
  if (!snapshot) return {};
  return {
    qualifiedLeads: String(snapshot.conversations),
    churnRisk: snapshot.hotLeadRate != null ? String(snapshot.hotLeadRate) : "—",
    upsellOps: String(Math.max(0, snapshot.liveVisitors - snapshot.conversations)),
    trialsEngaged: String(snapshot.liveVisitors),
    conversions: String(snapshot.conversionRate != null ? `${snapshot.conversionRate}%` : "—"),
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
    conversionRate: snapshot.conversionRate != null ? `${snapshot.conversionRate}%` : "—",
  } as Record<string, string>;
}

/** Headline KPIs; compact mode for category dashboard header strip. */
export function CategoryTopKpiRow({ kpis, compact = false }: Props) {
  const { sessions, dashboardStats } = useDashboardContext();
  const snapshot =
    dashboardStats ?? (sessions ? computeKpiSnapshot(sessions) : undefined);
  const values = buildValues(snapshot);

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {values[kpi.key] ?? "—"}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.key}>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{values[kpi.key] ?? "—"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
