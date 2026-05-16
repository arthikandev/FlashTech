import type { Id } from "@/convex/ids";
import type { SessionDetailResult } from "@/convex/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntentBadge } from "./IntentBadge";
import { SentimentArcChart } from "./SentimentArcChart";
import { SlackAlertCard } from "./SlackAlertCard";

type Props = {
  visitorId: Id<"visitors"> | null;
  detail: SessionDetailResult | null | undefined;
  variant?: "default" | "panel";
};

export function SessionDetail({ visitorId, detail, variant = "default" }: Props) {
  if (!visitorId) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Select a session to view intelligence, transcript, and CRM.
      </p>
    );
  }

  if (detail === undefined) {
    return <p className="text-sm text-muted-foreground">Loading detail…</p>;
  }

  if (detail === null) {
    return <p className="text-sm text-muted-foreground">Visitor not found.</p>;
  }

  const intel = detail.intelligence;
  const conv = detail.conversation;
  const crm = detail.visitor.crmData;
  const name = crm?.name ?? detail.visitor.fingerprint;

  return (
    <div className="flex flex-col gap-4 text-sm">
      {(intel?.intentScore ?? 0) >= 80 && <SlackAlertCard detail={detail} />}

      <Tabs defaultValue="intelligence">
        <TabsList className="w-full">
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="mt-3">
          <Card className={variant === "panel" ? "bg-background" : undefined}>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Intelligence
                  </p>
                  <p className="mt-1 text-base font-medium">{name}</p>
                </div>
                <IntentBadge score={intel?.intentScore} />
              </div>
              {intel?.personalisedOpener && (
                <p className="border-l-2 border-primary pl-3 text-sm leading-relaxed">
                  {intel.personalisedOpener}
                </p>
              )}
              {intel?.recommendedAction && (
                <p className="text-xs text-muted-foreground">→ {intel.recommendedAction}</p>
              )}
              {intel?.signals && intel.signals.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {intel.signals.map((sig) => (
                    <Badge key={sig} variant="secondary" className="text-[10px]">
                      {sig}
                    </Badge>
                  ))}
                </div>
              )}
              {conv?.sentimentArc && conv.sentimentArc.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Intent arc
                  </p>
                  <SentimentArcChart arc={conv.sentimentArc} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="mt-3">
          <Card>
            <CardContent className="pt-4">
              {conv?.transcript && conv.transcript.length > 0 ? (
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {conv.transcript.map((t, i) => (
                    <div
                      key={i}
                      className={`rounded-md px-3 py-2 text-xs ${
                        t.role === "user"
                          ? "ml-2 bg-muted text-foreground"
                          : "mr-2 bg-primary/10 text-muted-foreground"
                      }`}
                    >
                      <span className="mb-0.5 block text-[10px] uppercase text-muted-foreground">
                        {t.role}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No transcript yet.</p>
              )}
              {conv?.duration != null && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Duration {Math.round(conv.duration / 1000)}s · Outcome: {conv.outcome ?? "—"}
                </p>
              )}
              {conv?.actionItems && conv.actionItems.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
                  {conv.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="mt-3">
          <Card>
            <CardContent className="pt-4">
              {crm ? (
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {crm.accountType && (
                    <>
                      <dt className="text-muted-foreground">Account</dt>
                      <dd>{crm.accountType}</dd>
                    </>
                  )}
                  {crm.churnRisk && (
                    <>
                      <dt className="text-muted-foreground">Churn risk</dt>
                      <dd className={crm.churnRisk === "high" ? "text-destructive" : ""}>
                        {crm.churnRisk}
                      </dd>
                    </>
                  )}
                  {crm.email && (
                    <>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="truncate">{crm.email}</dd>
                    </>
                  )}
                  {detail.visitor.crmId && (
                    <>
                      <dt className="text-muted-foreground">CRM ID</dt>
                      <dd>{detail.visitor.crmId}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">No CRM enrichment yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
