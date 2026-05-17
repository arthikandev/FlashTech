import { CategoryDashboardHeader } from "@/components/categories/CategoryDashboardHeader";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { useDashboardContext } from "../context/DashboardContext";
import { AnalyticsScopeNote } from "../components/AnalyticsScopeNote";
import { KpiGrid } from "../sections/KpiGrid";
import { ConversationAnalytics } from "../sections/ConversationAnalytics";
import { IntentHeatmap } from "../sections/IntentHeatmap";
import { useAnalyticsSessions } from "@/hooks/useAnalyticsSessions";

export function AnalyticsPage() {
  const {
    business,
    dashboardStats,
    detail,
    embedKey,
    businessId,
    canLoadMoreSessions,
    hasMembershipForEmbed,
    category: dashboardCategory,
  } = useDashboardContext();
  const category = useBusinessCategory();

  const { sessions: analyticsSessions, loading: analyticsLoading } = useAnalyticsSessions({
    embedKey,
    businessId,
    useAuthQueries: hasMembershipForEmbed,
  });

  const chartSessions = analyticsLoading ? undefined : analyticsSessions;

  return (
    <div className="space-y-8">
      <CategoryDashboardHeader
        title="Analytics"
        category={category}
        clientName={business?.name}
      />
      <KpiGrid sessions={chartSessions} stats={dashboardStats} category={dashboardCategory} />
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
