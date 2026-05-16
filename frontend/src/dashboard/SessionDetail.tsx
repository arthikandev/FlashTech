import { useQuery } from "convex/react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";
import type { SessionDetailResult } from "../convex/types";

type Props = {
  visitorId: Id<"visitors"> | null;
};

export function SessionDetail({ visitorId }: Props) {
  const detail = useQuery(
    api.intelligence.getSessionDetail,
    visitorId ? { visitorId } : "skip"
  ) as SessionDetailResult | null | undefined;

  if (!visitorId) {
    return (
      <p className="text-slate-400 text-sm">Select a session to view detail.</p>
    );
  }

  if (detail === undefined) {
    return <p className="text-slate-400 text-sm">Loading detail…</p>;
  }

  if (detail === null) {
    return <p className="text-slate-400 text-sm">Visitor not found.</p>;
  }

  const intel = detail.intelligence;
  const conv = detail.conversation;

  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Visitor</h3>
        <p className="text-white font-medium">
          {detail.visitor.crmData?.name ?? detail.visitor.fingerprint}
        </p>
        <p className="text-slate-400">Returns: {detail.visitor.returnCount}</p>
      </section>

      {intel && (
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Intelligence
          </h3>
          {intel.intentScore != null && (
            <p className="text-emerald-400 font-semibold text-lg">{intel.intentScore}</p>
          )}
          {intel.personalisedOpener && (
            <p className="text-slate-300 mt-2">{intel.personalisedOpener}</p>
          )}
          {intel.recommendedAction && (
            <p className="text-slate-400 mt-2">→ {intel.recommendedAction}</p>
          )}
        </section>
      )}

      {conv && (
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Conversation
          </h3>
          <p className="text-slate-400">Outcome: {conv.outcome ?? "—"}</p>
          {conv.actionItems && conv.actionItems.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-slate-300">
              {conv.actionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {conv.transcript && conv.transcript.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {conv.transcript.map((t: { role: string; text: string }, i: number) => (
                <p key={i} className="text-slate-400">
                  <span className="text-slate-500">{t.role}:</span> {t.text}
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
