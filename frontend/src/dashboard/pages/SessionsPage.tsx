import { X } from "lucide-react";
import { useDashboardContext } from "../context/DashboardContext";
import { LiveSessionsTable } from "../sections/LiveSessionsTable";
import { SessionDetail } from "../SessionDetail";

export function SessionsPage() {
  const {
    sessions,
    businessId,
    signedIn,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    pulseIds,
    detail,
  } = useDashboardContext();

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col lg:flex-row gap-4">
      <div className={`flex min-h-0 flex-1 flex-col ${selectedVisitorId ? "lg:max-w-[58%]" : ""}`}>
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-dash-ink">Live Sessions</h1>
          <p className="text-xs text-dash-muted">
            Select a visitor to inspect intelligence, transcript, and CRM data
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <LiveSessionsTable
            sessions={sessions}
            businessReady={Boolean(businessId) || !signedIn}
            selectedVisitorId={selectedVisitorId}
            onSelect={setSelectedVisitorId}
            searchQuery={search}
            highlightIds={pulseIds}
          />
        </div>
      </div>

      {selectedVisitorId && (
        <aside className="flex w-full shrink-0 flex-col border border-dash-border bg-dash-surface lg:w-[42%] rounded-md overflow-hidden">
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
      <div className="flex items-center justify-between border-b border-dash-border px-4 py-3">
        <h2 className="text-sm font-semibold text-dash-ink">Session detail</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
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
