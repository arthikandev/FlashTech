import { useQuery } from "convex/react";
import { Clock, Gauge, Loader2, UserRound, Users } from "lucide-react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Session = {
  visitorId: Id<"visitors">;
  fingerprint: string;
  name?: string;
  intentScore?: number;
  personalisedOpener?: string;
  recommendedAction?: string;
  returnCount: number;
  lastSeenAt: number;
  language?: string;
};

type Props = {
  businessId: Id<"businesses"> | undefined;
  selectedVisitorId: Id<"visitors"> | null;
  onSelect: (visitorId: Id<"visitors">) => void;
};

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="flex h-12 w-12 items-center justify-center border border-border bg-card-elevated text-muted-foreground mb-4">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

export function LiveSessions({ businessId, selectedVisitorId, onSelect }: Props) {
  const sessions = useQuery(
    api.intelligence.listLiveSessions,
    businessId ? { businessId } : "skip"
  ) as Session[] | undefined;

  if (!businessId) {
    return (
      <EmptyState
        icon={Users}
        title="Select a tenant"
        description="Choose a business tenant above to load live visitor sessions."
      />
    );
  }

  if (sessions === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading sessions…
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="No visitors yet"
        description="Open a demo site with the embed script, then reload the page in the same browser."
      />
    );
  }

  return (
    <ul className="divide-y divide-border border border-border overflow-hidden bg-background/40 max-h-[min(520px,60vh)] overflow-y-auto">
      {sessions.map((s) => {
        const selected = selectedVisitorId === s.visitorId;
        const hot = (s.intentScore ?? 0) > 80;
        return (
          <li key={s.visitorId}>
            <button
              type="button"
              onClick={() => onSelect(s.visitorId)}
              className={cn(
                "w-full text-left px-4 py-3.5 transition-colors flex gap-3 items-start",
                selected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-card-elevated/80 border-l-2 border-l-transparent"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center border text-xs font-medium",
                  selected
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-card-elevated text-muted-foreground"
                )}
              >
                <UserRound className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {s.name ?? s.fingerprint.slice(0, 14)}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(s.lastSeenAt).toLocaleTimeString()}
                  </span>
                  <span>{s.returnCount} visits</span>
                  {s.language && <span className="uppercase">{s.language}</span>}
                </p>
              </div>
              {s.intentScore != null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 shrink-0",
                    hot
                      ? "bg-primary/20 text-primary"
                      : "bg-card-elevated text-muted-foreground border border-border"
                  )}
                >
                  <Gauge className="h-3 w-3" />
                  {s.intentScore}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
