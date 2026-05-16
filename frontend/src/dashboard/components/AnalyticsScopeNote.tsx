import type { DashboardStats } from "@/convex/types";

const ANALYTICS_SAMPLE_SIZE = 50;

type Props = {
  stats?: DashboardStats;
  loadedCount: number;
  canLoadMore: boolean;
  /** When true, charts use the dedicated analytics query (up to 50 visitors). */
  chartSample?: boolean;
};

export function AnalyticsScopeNote({
  stats,
  loadedCount,
  canLoadMore,
  chartSample = false,
}: Props) {
  if (!stats && loadedCount === 0) return null;

  const total = stats?.liveVisitors;

  let scopeLabel: string;
  if (chartSample) {
    if (total != null && total > ANALYTICS_SAMPLE_SIZE) {
      scopeLabel = `Charts sample the ${ANALYTICS_SAMPLE_SIZE} most recent of ${total} visitors. KPIs above reflect the full workspace.`;
    } else if (total != null) {
      scopeLabel = `Charts and KPIs reflect all ${total} visitor${total === 1 ? "" : "s"} in this workspace.`;
    } else {
      scopeLabel = `Charts reflect up to ${ANALYTICS_SAMPLE_SIZE} recent visitors.`;
    }
  } else if (total != null && (canLoadMore || loadedCount < total)) {
    scopeLabel = `Charts use ${loadedCount} of ${total} visitors loaded — load more on Live Sessions for fuller distribution.`;
  } else if (total != null) {
    scopeLabel = `Aggregates reflect ${total} visitor${total === 1 ? "" : "s"} in this workspace.`;
  } else {
    scopeLabel = `Charts reflect ${loadedCount} loaded visitor${loadedCount === 1 ? "" : "s"}.`;
  }

  return <p className="text-xs text-muted-foreground">{scopeLabel}</p>;
}
