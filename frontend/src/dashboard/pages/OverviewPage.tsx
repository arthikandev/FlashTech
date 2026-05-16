import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { useDashboardContext } from "../context/DashboardContext";
import { KpiGrid } from "../sections/KpiGrid";
import { LiveSessionsTable } from "../sections/LiveSessionsTable";

export function OverviewPage() {
  const {
    business,
    sessions,
    businessId,
    signedIn,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    pulseIds,
  } = useDashboardContext();

  const liveCount = sessions?.length ?? 0;
  const title = business?.name ? `${business.name} Intelligence` : "Customer Intelligence";
  const subtitle =
    liveCount > 0
      ? `${liveCount} visitor${liveCount === 1 ? "" : "s"} tracked now. Intent-scored openers ready for avatar sessions.`
      : "Embed PresenceIQ on your site to start tracking visitors and scoring intent in real time.";

  return (
    <div className="space-y-6">
      <section className="dash-card overflow-hidden">
        <OverviewHero
          title={title}
          subtitle={subtitle}
          bpAgentId={business?.avatarConfig?.bpAgentId}
        />
      </section>

      <KpiGrid sessions={sessions} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-dash-ink">Recent live sessions</h2>
            <p className="text-xs text-dash-muted">Latest visitors — open full table for details</p>
          </div>
          <Link
            to="/dashboard/sessions"
            className="inline-flex items-center gap-1 text-xs text-dash-accent hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <LiveSessionsTable
          sessions={sessions?.slice(0, 5)}
          businessReady={Boolean(businessId) || !signedIn}
          selectedVisitorId={selectedVisitorId}
          onSelect={setSelectedVisitorId}
          searchQuery={search}
          highlightIds={pulseIds}
          compact
        />
      </section>
    </div>
  );
}

function OverviewHero({
  title,
  subtitle,
  bpAgentId,
}: {
  title: string;
  subtitle: string;
  bpAgentId?: string | null;
}) {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="dash-label text-dash-accent">Beyond Presence · Live</p>
        <h1 className="mt-1 text-2xl font-semibold text-dash-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-lg text-sm text-dash-muted leading-relaxed">{subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/dashboard/sessions"
            className="inline-flex items-center gap-1.5 rounded-md bg-dash-accent px-3 py-2 text-xs font-medium text-black hover:opacity-90"
          >
            Live sessions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/dashboard/avatar"
            className="inline-flex items-center gap-1.5 rounded-md border border-dash-border px-3 py-2 text-xs text-dash-ink hover:bg-dash-hover"
          >
            <Radio className="h-3.5 w-3.5" />
            Avatar metrics
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-dash-border bg-dash-bg">
        <div className="flex items-center justify-between border-b border-dash-border px-3 py-2">
          <span className="dash-label">Avatar preview</span>
          <span className="text-[10px] text-dash-accent">Beyond Presence</span>
        </div>
        <BeyondPresenceFrame agentId={bpAgentId} height={220} className="rounded-none" />
      </div>
    </div>
  );
}
