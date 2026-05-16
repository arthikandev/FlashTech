import { X } from "lucide-react";
import { useDashboardContext } from "../context/DashboardContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { LiveSessionsTable } from "../sections/LiveSessionsTable";
import { SessionDetail } from "../SessionDetail";

export function SessionsPage() {
  const {
    filteredSessions: sessions,
    businessId,
    signedIn,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    pulseIds,
    detail,
    canLoadMoreSessions,
    sessionsLoadingMore,
    loadMoreSessions,
  } = useDashboardContext();

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col lg:flex-row gap-4">
      <div className={`flex min-h-0 flex-1 flex-col ${selectedVisitorId ? "lg:max-w-[58%]" : ""}`}>
        <div className="mb-3">
          <DashboardPageHeader
            title="Live Sessions"
            subtitle="Select a visitor to inspect intelligence, transcript, and CRM data"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <LiveSessionsTable
            sessions={sessions}
            businessReady={Boolean(businessId) || !signedIn}
            selectedVisitorId={selectedVisitorId}
            onSelect={setSelectedVisitorId}
            searchQuery={search}
            highlightIds={pulseIds}
            canLoadMore={canLoadMoreSessions}
            loadingMore={sessionsLoadingMore}
            onLoadMore={() => loadMoreSessions(25)}
          />
        </div>
      </div>

      {selectedVisitorId && (
        <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-md border border-border bg-card lg:w-[42%]">
          <SessionPanel
            onClose={() => setSelectedVisitorId(null)}
            visitorId={selectedVisitorId}
            detail={detail}
          />
        </aside>
      )}
    </div>
  );
}

function SessionPanel({
  onClose,
  visitorId,
  detail,
}: {
  onClose: () => void;
  visitorId: NonNullable<ReturnType<typeof useDashboardContext>["selectedVisitorId"]>;
  detail: ReturnType<typeof useDashboardContext>["detail"];
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Session detail</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <SessionDetail visitorId={visitorId} detail={detail} variant="panel" />
      </div>
    </>
  );
}
