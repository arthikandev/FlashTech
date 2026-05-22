import { motion } from "framer-motion";
import type { Id } from "@/convex/ids";
import type { LiveSession } from "@/convex/types";
import { IntentBadge } from "../IntentBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

type Props = {
  sessions: LiveSession[] | undefined;
  businessReady: boolean;
  selectedVisitorId: Id<"visitors"> | null;
  onSelect: (id: Id<"visitors">) => void;
  searchQuery: string;
  highlightIds: Set<string>;
  compact?: boolean;
  canLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

function deriveSentiment(s: LiveSession): string {
  const score = s.intentScore;
  if (score == null) return "Analyzing…";
  if (score >= 70) return "Positive";
  if (score >= 40) return "Neutral";
  return "Cautious";
}

function deriveStatus(s: LiveSession): string {
  if (s.hasConversation) return "Avatar active";
  if ((s.intentScore ?? 0) >= 80) return "Hot lead";
  return "Tracking";
}

function deriveCrm(s: LiveSession): string {
  if (s.crmAccountType) return s.crmAccountType;
  if (s.returnCount > 1) return "Returning visitor";
  return "New visitor";
}

const MotionTableRow = motion.create(TableRow);

export function LiveSessionsTable({
  sessions,
  businessReady,
  selectedVisitorId,
  onSelect,
  searchQuery,
  highlightIds,
  compact = false,
  canLoadMore = false,
  loadingMore = false,
  onLoadMore,
}: Props) {
  if (!businessReady) {
    return <LoadingState variant="inline" label="Loading business…" />;
  }

  if (sessions === undefined) {
    return <LoadingState variant="table" rows={5} />;
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = sessions.filter((s) => {
    if (!q) return true;
    const name = (s.name ?? s.fingerprint).toLowerCase();
    const trail = (s.pageTrail ?? "").toLowerCase();
    const rec = (s.recommendedAction ?? "").toLowerCase();
    return name.includes(q) || trail.includes(q) || rec.includes(q);
  });

  if (sessions.length === 0) {
    return (
      <section>
        {!compact && (
          <SectionHeading
            title="Live Visitor Intelligence"
            subtitle="Real-time visitor tracking and AI analysis"
            align="left"
            compact
          />
        )}
        <EmptyState
          preset="no-data"
          variant="light"
          title="No visitors yet"
          description="Run your live advisor or embed the widget — sessions appear here in real time."
        />
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section>
        {!compact && (
          <SectionHeading
            title="Live Visitor Intelligence"
            subtitle="Real-time visitor tracking and AI analysis"
            align="left"
            compact
          />
        )}
        <EmptyState
          preset="no-results"
          variant="light"
          description={`No sessions match "${searchQuery.trim()}".`}
        />
      </section>
    );
  }

  return (
    <section>
      {!compact && (
        <SectionHeading
          title="Live Visitor Intelligence"
          subtitle="Real-time visitor tracking and AI analysis"
          align="left"
          compact
        />
      )}
      <Card className={`${compact ? "" : "mt-4"} hidden overflow-hidden md:block`}>
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Visitor
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Intent
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Sentiment
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Pages
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                CRM
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Recommendation
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s, i) => {
              const selected = selectedVisitorId === s.visitorId;
              const highlight = highlightIds.has(s.visitorId);
              return (
                <MotionTableRow
                  key={s.visitorId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelect(s.visitorId)}
                  className={`cursor-pointer ${
                    selected ? "bg-primary/5" : ""
                  } ${highlight ? "row-highlight" : ""}`}
                >
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {s.name ?? `${s.fingerprint.slice(0, 12)}…`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Returns {s.returnCount}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <IntentBadge score={s.intentScore} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {deriveSentiment(s)}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate px-4 py-3 text-xs text-muted-foreground">
                    {s.pageTrail ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{deriveCrm(s)}</TableCell>
                  <TableCell className="max-w-[160px] truncate px-4 py-3 text-xs text-muted-foreground">
                    {s.recommendedAction ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/90">
                      {s.hasConversation && (
                        <span className="ai-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                      {deriveStatus(s)}
                    </span>
                  </TableCell>
                </MotionTableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {!compact && canLoadMore && onLoadMore && (
        <div className="mt-3 hidden justify-center md:flex">
          <Button type="button" variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more sessions"}
          </Button>
        </div>
      )}

      <div className="mt-4 space-y-2 md:hidden">
        {filtered.map((s) => {
          const selected = selectedVisitorId === s.visitorId;
          return (
            <button
              key={s.visitorId}
              type="button"
              onClick={() => onSelect(s.visitorId)}
              className={`min-h-[44px] w-full rounded-xl border bg-card p-4 text-left transition-colors ${
                selected ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {s.name ?? `${s.fingerprint.slice(0, 12)}…`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{deriveStatus(s)}</p>
                </div>
                <IntentBadge score={s.intentScore} />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {s.recommendedAction ?? "—"}
              </p>
            </button>
          );
        })}
        {canLoadMore && onLoadMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more sessions"}
          </Button>
        )}
      </div>
    </section>
  );
}
