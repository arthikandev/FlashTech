import type { Id } from "@/convex/ids";
import type { SessionDetailResult } from "@/convex/types";
import { IntentBadge } from "./IntentBadge";
import { SentimentArcChart } from "./SentimentArcChart";
import { SlackAlertCard } from "./SlackAlertCard";

type Props = {
  visitorId: Id<"visitors"> | null;
  detail: SessionDetailResult | null | undefined;
  variant?: "default" | "panel";
};

export function SessionDetail({ visitorId, detail, variant = "default" }: Props) {
  const cardClass =
    variant === "panel"
      ? "rounded-md border border-dash-border bg-dash-bg p-4"
      : "rounded-md border border-dash-border bg-dash-surface p-4";

  if (!visitorId) {
    return (
      <p className="text-dash-muted text-sm py-8 text-center">
        Select a session to view intelligence, transcript, and CRM.
      </p>
    );
  }

  if (detail === undefined) {
    return <p className="text-dash-muted text-sm">Loading detail…</p>;
  }

  if (detail === null) {
    return <p className="text-dash-muted text-sm">Visitor not found.</p>;
  }

  const intel = detail.intelligence;
  const conv = detail.conversation;
  const crm = detail.visitor.crmData;
  const name = crm?.name ?? detail.visitor.fingerprint;

  return (
    <div className="space-y-4 text-sm">
      <section className={cardClass}>
        <IntelHeader name={name} intel={intel} />
      </section>

      {(intel?.intentScore ?? 0) >= 80 && <SlackAlertCard detail={detail} />}

      {conv?.sentimentArc && conv.sentimentArc.length > 0 && (
        <section className={cardClass}>
          <h3 className="dash-label mb-3">Intent arc</h3>
          <SentimentArcChart arc={conv.sentimentArc} />
        </section>
      )}

      {conv?.transcript && conv.transcript.length > 0 && (
        <section className={cardClass}>
          <h3 className="dash-label mb-3">Transcript</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {conv.transcript.map((t, i) => (
              <div
                key={i}
                className={`rounded-md px-3 py-2 text-xs ${
                  t.role === "user"
                    ? "bg-dash-hover text-dash-ink ml-2"
                    : "bg-dash-accent/10 text-dash-muted mr-2"
                }`}
              >
                <span className="text-[10px] uppercase text-dash-muted block mb-0.5">
                  {t.role}
                </span>
                {t.text}
              </div>
            ))}
          </div>
          {conv.duration != null && (
            <p className="text-[10px] text-dash-muted mt-2">
              Duration {Math.round(conv.duration / 1000)}s · Outcome: {conv.outcome ?? "—"}
            </p>
          )}
        </section>
      )}

      {conv?.actionItems && conv.actionItems.length > 0 && (
        <section className={cardClass}>
          <h3 className="dash-label mb-2">Action items</h3>
          <ul className="list-disc list-inside text-dash-muted space-y-1 text-xs">
            {conv.actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={cardClass}>
        <h3 className="dash-label mb-2">CRM record</h3>
        {crm ? (
          <dl className="grid grid-cols-2 gap-2 text-xs">
            {crm.accountType && (
              <>
                <dt className="text-dash-muted">Account</dt>
                <dd className="text-dash-ink">{crm.accountType}</dd>
              </>
            )}
            {crm.churnRisk && (
              <>
                <dt className="text-dash-muted">Churn risk</dt>
                <dd className={crm.churnRisk === "high" ? "text-rose-400" : "text-dash-ink"}>
                  {crm.churnRisk}
                </dd>
              </>
            )}
            {crm.email && (
              <>
                <dt className="text-dash-muted">Email</dt>
                <dd className="text-dash-ink truncate">{crm.email}</dd>
              </>
            )}
            {detail.visitor.crmId && (
              <>
                <dt className="text-dash-muted">CRM ID</dt>
                <dd className="text-dash-ink">{detail.visitor.crmId}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-dash-muted text-xs">No CRM enrichment yet.</p>
        )}
      </section>
    </div>
  );
}

function IntelHeader({
  name,
  intel,
}: {
  name: string;
  intel: SessionDetailResult["intelligence"];
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="dash-label">Intelligence</h3>
          <p className="text-base font-medium text-dash-ink mt-1">{name}</p>
        </div>
        <IntentBadge score={intel?.intentScore} />
      </div>
      {intel?.personalisedOpener && (
        <p className="mt-3 text-dash-ink leading-relaxed border-l-2 border-dash-accent pl-3 text-sm">
          {intel.personalisedOpener}
        </p>
      )}
      {intel?.recommendedAction && (
        <p className="mt-2 text-xs text-dash-muted">→ {intel.recommendedAction}</p>
      )}
      {intel?.signals && intel.signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {intel.signals.map((sig) => (
            <span
              key={sig}
              className="rounded-full bg-dash-hover px-2 py-0.5 text-[10px] text-dash-muted"
            >
              {sig}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
