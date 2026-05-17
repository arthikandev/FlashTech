import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { useDashboardContext } from "../context/DashboardContext";
import { KpiGrid } from "../sections/KpiGrid";
import { LiveSessionsTable } from "../sections/LiveSessionsTable";

export function OverviewPage() {
  const {
    business,
    category,
    sessions,
    dashboardStats,
    filteredSessions,
    businessId,
    signedIn,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    pulseIds,
  } = useDashboardContext();

  const liveCount = dashboardStats?.liveVisitors ?? sessions?.length ?? 0;
  const workspaceName = business?.name ?? category?.name;
  const title = workspaceName ? `${workspaceName} Intelligence` : "Customer Intelligence";
  const metricHint = category?.coreMetric ? ` Core metric: ${category.coreMetric}.` : "";
  const subtitle =
    liveCount > 0
      ? `${liveCount} visitor${liveCount === 1 ? "" : "s"} tracked now. Intent-scored openers ready for avatar sessions.${metricHint}`
      : `Embed PresenceIQ on your site to start tracking visitors and scoring intent in real time.${metricHint}`;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <OverviewHero
          title={title}
          subtitle={subtitle}
          categoryTag={category?.tag}
          bpAgentId={business?.avatarConfig?.bpAgentId}
        />
      </Card>

      <KpiGrid sessions={sessions} stats={dashboardStats} category={category} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent live sessions</h2>
            <p className="text-xs text-muted-foreground">
              Latest visitors — open full table for details
            </p>
          </div>
          <Link
            to="/dashboard/sessions"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <LiveSessionsTable
          sessions={filteredSessions?.slice(0, 5)}
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
  categoryTag,
  bpAgentId,
}: {
  title: string;
  subtitle: string;
  categoryTag?: string;
  bpAgentId?: string | null;
}) {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          {categoryTag ? `${categoryTag} · ` : ""}Beyond Presence · Live
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button render={<Link to="/dashboard/sessions" />} size="sm">
            Live sessions
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button render={<Link to="/dashboard/avatar" />} variant="outline" size="sm">
            <Radio data-icon="inline-start" />
            Avatar metrics
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Avatar preview
          </span>
          <span className="text-[10px] text-primary">Beyond Presence</span>
        </div>
        <BeyondPresenceFrame agentId={bpAgentId} height={220} className="rounded-none" />
      </div>
    </div>
  );
}
