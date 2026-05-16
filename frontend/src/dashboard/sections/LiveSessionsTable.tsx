import { motion } from "framer-motion";
import type { Id } from "@/convex/ids";
import type { LiveSession } from "@/convex/types";
import { IntentBadge } from "../IntentBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

type Props = {
  sessions: LiveSession[] | undefined;
  businessReady: boolean;
  selectedVisitorId: Id<"visitors"> | null;
  onSelect: (id: Id<"visitors">) => void;
  searchQuery: string;
  highlightIds: Set<string>;
  compact?: boolean;
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

export function LiveSessionsTable({
  sessions,
  businessReady,
  selectedVisitorId,
  onSelect,
  searchQuery,
  highlightIds,
  compact = false,
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
          title="No visitors yet"
          description="Open a demo site, reload pricing, then return here."
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
        <EmptyState preset="no-results" description={`No sessions match "${searchQuery.trim()}".`} />
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
      <div
        className={`${compact ? "" : "mt-4"} overflow-x-auto rounded-md border border-dash-border bg-dash-surface hidden md:block`}
      >
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-[#212121] text-left text-[10px] uppercase tracking-widest text-gray-600">
              <th className="px-4 py-3 font-medium">Visitor</th>
              <th className="px-4 py-3 font-medium">Intent</th>
              <th className="px-4 py-3 font-medium">Sentiment</th>
              <th className="px-4 py-3 font-medium">Pages</th>
              <th className="px-4 py-3 font-medium">CRM</th>
              <th className="px-4 py-3 font-medium">Recommendation</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const selected = selectedVisitorId === s.visitorId;
              const highlight = highlightIds.has(s.visitorId);
              return (
                <motion.tr
                  key={s.visitorId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelect(s.visitorId)}
                  className={`cursor-pointer border-b border-[#212121]/80 transition-colors hover:bg-white/[0.03] ${
                    selected ? "bg-primary/5" : ""
                  } ${highlight ? "row-highlight" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#E1E0CC]">
                      {s.name ?? `${s.fingerprint.slice(0, 12)}…`}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      Returns {s.returnCount}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <IntentBadge score={s.intentScore} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{deriveSentiment(s)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                    {s.pageTrail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{deriveCrm(s)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">
                    {s.recommendedAction ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/90">
                      {s.hasConversation && (
                        <span className="ai-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                      {deriveStatus(s)}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 md:hidden space-y-2">
        {filtered.map((s) => {
          const selected = selectedVisitorId === s.visitorId;
          return (
            <button
              key={s.visitorId}
              type="button"
              onClick={() => onSelect(s.visitorId)}
              className={`w-full text-left rounded-xl border border-[#212121] glass-panel p-4 min-h-[44px] transition-colors ${
                selected ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[#E1E0CC]">
                    {s.name ?? `${s.fingerprint.slice(0, 12)}…`}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{deriveStatus(s)}</p>
                </div>
                <IntentBadge score={s.intentScore} />
              </div>
              <p className="text-xs text-gray-500 mt-2 truncate">
                {s.recommendedAction ?? "—"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
