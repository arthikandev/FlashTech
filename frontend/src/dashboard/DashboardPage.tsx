import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Activity,
  Building2,
  ChevronRight,
  Flame,
  LayoutDashboard,
  Radio,
  Users,
} from "lucide-react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";
import type { Business } from "../convex/types";
import { PageHeader } from "../components/PageHeader";
import { LiveSessions } from "./LiveSessions";
import { SessionDetail } from "./SessionDetail";

const EMBED_KEYS = [
  { key: "seylan-demo", label: "Seylan Bank", icon: Building2 },
  { key: "cloudmetrics-demo", label: "CloudMetrics", icon: Activity },
  { key: "coral-demo", label: "Coral Resort", icon: Radio },
] as const;

type SessionRow = {
  visitorId: Id<"visitors">;
  intentScore?: number;
  lastSeenAt: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-card p-4 flex gap-3 items-start">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-card-elevated text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-0.5 tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [embedKey, setEmbedKey] = useState<string>("seylan-demo");
  const [selectedVisitorId, setSelectedVisitorId] = useState<Id<"visitors"> | null>(
    null
  );

  const business = useQuery(api.businesses.getByEmbedKey, { embedKey }) as
    | Business
    | null
    | undefined;
  const businessId = business?._id;

  const sessions = useQuery(
    api.intelligence.listLiveSessions,
    businessId ? { businessId } : "skip"
  ) as SessionRow[] | undefined;

  const stats = useMemo(() => {
    if (!sessions) return null;
    const withScore = sessions.filter((s) => s.intentScore != null);
    const hot = sessions.filter((s) => (s.intentScore ?? 0) > 80).length;
    const avg =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((a, s) => a + (s.intentScore ?? 0), 0) / withScore.length
          )
        : "—";
    return { total: sessions.length, hot, avg };
  }, [sessions]);

  const activeTenant = EMBED_KEYS.find((t) => t.key === embedKey) ?? EMBED_KEYS[0];
  const TenantIcon = activeTenant.icon;

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader
        label="Live operator view"
        title="Dashboard"
        description="Reactive sessions from Convex — open a demo site, then reload to see return visitors without refreshing this page."
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={Users} label="Sessions" value={stats.total} hint="Recent visitors" />
          <StatCard icon={Flame} label="Hot leads" value={stats.hot} hint="Intent above 80" />
          <StatCard
            icon={LayoutDashboard}
            label="Avg intent"
            value={stats.avg}
            hint="Across scored sessions"
          />
          <StatCard
            icon={Activity}
            label="Tenant"
            value={activeTenant.label.split(" ")[0]}
            hint={embedKey}
          />
        </div>
      )}

      <div className="border border-border bg-card p-4 md:p-5 max-w-lg">
        <label className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
            <TenantIcon className="h-3.5 w-3.5" />
            Business tenant
          </span>
          <div className="relative">
            <select
              value={embedKey}
              onChange={(e) => {
                setEmbedKey(e.target.value);
                setSelectedVisitorId(null);
              }}
              className="w-full appearance-none bg-card-elevated border border-border px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {EMBED_KEYS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
          </div>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 min-h-[420px]">
        <section className="border border-border bg-card flex flex-col min-h-[360px]">
          <div className="flex items-center gap-2 border-b border-border px-4 md:px-5 py-3">
            <Radio className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-[10px] uppercase tracking-widest text-primary font-medium">
              Live sessions
            </h2>
          </div>
          <div className="flex-1 p-4 md:p-5 overflow-hidden">
            <LiveSessions
              businessId={businessId}
              selectedVisitorId={selectedVisitorId}
              onSelect={setSelectedVisitorId}
            />
          </div>
        </section>

        <section className="border border-border bg-card flex flex-col min-h-[360px]">
          <div className="flex items-center gap-2 border-b border-border px-4 md:px-5 py-3">
            <LayoutDashboard className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-[10px] uppercase tracking-widest text-primary font-medium">
              Session detail
            </h2>
          </div>
          <div className="flex-1 p-4 md:p-5 overflow-y-auto">
            <SessionDetail visitorId={selectedVisitorId} />
          </div>
        </section>
      </div>
    </div>
  );
}
