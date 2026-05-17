import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationAnalytics } from "@/dashboard/sections/ConversationAnalytics";
import { LiveSessionsTable } from "@/dashboard/sections/LiveSessionsTable";
import { useDashboardContext } from "@/dashboard/context/DashboardContext";

type ListProps = {
  title: string;
  items: { label: string; count: number }[];
};

export function TopQuestionsList({ title, items }: ListProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex justify-between gap-4">
              <span className="text-foreground">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">({item.count})</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CategoryDashboardCore() {
  const {
    sessions,
    filteredSessions,
    businessId,
    signedIn,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    pulseIds,
    detail,
  } = useDashboardContext();

  return (
    <div className="space-y-6">
      <ConversationAnalytics sessions={sessions} detail={detail} />
      <LiveSessionsTable
        sessions={filteredSessions?.slice(0, 8)}
        businessReady={Boolean(businessId) || !signedIn}
        selectedVisitorId={selectedVisitorId}
        onSelect={setSelectedVisitorId}
        searchQuery={search}
        highlightIds={pulseIds}
        compact
      />
    </div>
  );
}
