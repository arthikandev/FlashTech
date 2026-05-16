import { useDashboardContext } from "../context/DashboardContext";
import { ConversationAnalytics } from "../sections/ConversationAnalytics";
import { IntentHeatmap } from "../sections/IntentHeatmap";

export function AnalyticsPage() {
  const { sessions, detail } = useDashboardContext();

  return <AnalyticsContent sessions={sessions} detail={detail} />;
}

function AnalyticsContent({
  sessions,
  detail,
}: {
  sessions: ReturnType<typeof useDashboardContext>["sessions"];
  detail: ReturnType<typeof useDashboardContext>["detail"];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-dash-ink">Analytics</h1>
        <p className="text-xs text-dash-muted">
          Conversation volume, intent distribution, and engagement heatmap
        </p>
      </div>
      <ConversationAnalytics sessions={sessions} detail={detail} />
      <IntentHeatmap sessions={sessions} />
    </div>
  );
}
