import type { Id } from "@/convex/ids";
import type { SessionDetailResult } from "@/convex/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { IntentBadge } from "../IntentBadge";
import { SlackAlertCard } from "../SlackAlertCard";

type Props = {
  visitorId: Id<"visitors"> | null;
  detail: SessionDetailResult | null | undefined;
};

export function ConversationCinema({ visitorId, detail }: Props) {
  return (
    <section id="cinema">
      <SectionHeading
        title="Live Conversation Preview"
        subtitle="Transcript, avatar session, and customer intelligence"
        align="left"
        compact
      />
      {!visitorId ? (
        <EmptyState
          preset="no-data"
          title="Select a visitor"
          description="Choose a row from the live sessions table to preview their Beyond Presence conversation."
        />
      ) : detail === undefined ? (
        <LoadingState variant="inline" label="Loading session…" />
      ) : detail === null ? (
        <EmptyState preset="error" title="Visitor not found" />
      ) : (
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 rounded-xl border border-[#212121] glass-panel p-4 max-h-80 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
              Transcript
            </p>
            {detail.conversation?.transcript?.length ? (
              <div className="space-y-2 text-xs">
                {detail.conversation.transcript.map((t, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 ${
                      t.role === "user"
                        ? "bg-[#212121] text-[#E1E0CC]"
                        : "bg-primary/10 text-gray-300"
                    }`}
                  >
                    <span className="text-[10px] uppercase text-gray-600 block mb-0.5">
                      {t.role === "user" ? "User" : "AI"}
                    </span>
                    {t.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {detail.intelligence?.personalisedOpener ??
                  "No transcript yet — avatar session pending."}
              </p>
            )}
          </div>

          <div className="lg:col-span-4 rounded-xl border border-[#212121] gradient-border overflow-hidden bg-black/60">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#212121]">
              <p className="text-[10px] uppercase tracking-widest text-gray-600">
                Beyond Presence
              </p>
              <span
                className={`text-[10px] uppercase tracking-widest ${
                  detail.conversation ? "text-primary" : "text-gray-500"
                }`}
              >
                {detail.conversation ? "Session live" : "Standby"}
              </span>
            </div>
            <BeyondPresenceFrame
              agentId={detail.business?.avatarConfig?.bpAgentId}
              height={320}
              className="rounded-none"
            />
          </div>

          <div className="lg:col-span-4 space-y-3">
            <IntelCard
              label="CRM status"
              value={detail.visitor.crmData?.accountType ?? "Prospect"}
            />
            <IntelCard
              label="Intent score"
              value={
                detail.intelligence?.intentScore != null
                  ? `${detail.intelligence.intentScore}/100`
                  : "—"
              }
            />
            <IntelCard
              label="Recommended action"
              value={detail.intelligence?.recommendedAction ?? "Monitor session"}
            />
            <IntelCard
              label="Emotional state"
              value={emotionalLabel(detail)}
            />
            {detail.conversation?.sentimentArc &&
            detail.conversation.sentimentArc.length > 0 ? (
              <div className="rounded-lg border border-[#212121] bg-black/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                  Sentiment arc
                </p>
                <div className="flex items-end gap-1 h-12">
                  {detail.conversation.sentimentArc.map((p) => (
                    <div
                      key={p.turn}
                      className="flex-1 rounded-t bg-indigo-500/50 min-w-[4px]"
                      style={{ height: `${Math.max(12, p.score)}%` }}
                      title={`Turn ${p.turn}: ${p.score}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Score</span>
              <IntentBadge score={detail.intelligence?.intentScore} />
            </div>
            <SlackAlertCard detail={detail} />
          </div>
        </div>
      )}
    </section>
  );
}

function emotionalLabel(detail: SessionDetailResult): string {
  const arc = detail.conversation?.sentimentArc;
  if (arc && arc.length > 0) {
    const last = arc[arc.length - 1]?.score ?? 0;
    if (last >= 70) return "Positive trajectory";
    if (last >= 40) return "Neutral trajectory";
    return "Needs attention";
  }
  return (detail.intelligence?.intentScore ?? 0) >= 70 ? "Interested" : "Evaluating";
}

function IntelCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#212121] bg-black/40 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-gray-600">{label}</p>
      <p className="text-sm text-[#E1E0CC] mt-0.5">{value}</p>
    </div>
  );
}
