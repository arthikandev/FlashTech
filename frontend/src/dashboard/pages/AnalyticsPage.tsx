import { useDashboardContext } from "../context/DashboardContext";
import { AnalyticsScopeNote } from "../components/AnalyticsScopeNote";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { KpiGrid } from "../sections/KpiGrid";
import { ConversationAnalytics } from "../sections/ConversationAnalytics";
import { IntentHeatmap } from "../sections/IntentHeatmap";
import { useAnalyticsSessions } from "@/hooks/useAnalyticsSessions";

export function AnalyticsPage() {
  const {
    dashboardStats,
    detail,
    embedKey,
    businessId,
    canLoadMoreSessions,
    hasMembershipForEmbed,
  } = useDashboardContext();

  const { sessions: analyticsSessions, loading: analyticsLoading } = useAnalyticsSessions({
    embedKey,
    businessId,
    useAuthQueries: hasMembershipForEmbed,
  });

  const chartSessions = analyticsLoading ? undefined : analyticsSessions;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Analytics"
        subtitle="Conversation volume, intent distribution, and engagement heatmap"
      />
      <KpiGrid sessions={chartSessions} stats={dashboardStats} />
      <AnalyticsScopeNote
        stats={dashboardStats}
        loadedCount={analyticsSessions?.length ?? 0}
        canLoadMore={canLoadMoreSessions}
        chartSample
      />
      <ConversationAnalytics sessions={chartSessions} detail={detail} />
      <IntentHeatmap sessions={chartSessions} />
    </div>
  );
}
