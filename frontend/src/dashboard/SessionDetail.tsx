import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import {
  Brain,
  ChevronRight,
  Loader2,
  MessageSquare,
  Sparkles,
  UserRound,
  ListChecks,
} from "lucide-react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";
import type { SessionDetailResult } from "../convex/types";
import { cn } from "@/lib/utils";

type Props = {
  visitorId: Id<"visitors"> | null;
};

function DetailBlock({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: typeof UserRound;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-background/50 p-4", className)}>
      <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary mb-3 font-medium">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function EmptyDetail({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="flex h-12 w-12 items-center justify-center border border-border bg-card-elevated text-muted-foreground mb-4">
        <Sparkles className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

export function SessionDetail({ visitorId }: Props) {
  const detail = useQuery(
    api.intelligence.getSessionDetail,
    visitorId ? { visitorId } : "skip"
  ) as SessionDetailResult | null | undefined;

  if (!visitorId) {
    return (
      <EmptyDetail message="Select a session from the list to view visitor intelligence and transcript." />
    );
  }

  if (detail === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading detail…
      </div>
    );
  }

  if (detail === null) {
    return <EmptyDetail message="Visitor not found." />;
  }

  const intel = detail.intelligence;
  const conv = detail.conversation;
  const hot = (intel?.intentScore ?? 0) > 80;

  return (
    <div className="space-y-4 text-sm">
      <DetailBlock icon={UserRound} title="Visitor">
        <p className="text-foreground font-medium text-base">
          {detail.visitor.crmData?.name ?? detail.visitor.fingerprint}
        </p>
        <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {detail.visitor.returnCount} return visits
        </p>
      </DetailBlock>

      {intel && (
        <DetailBlock icon={Brain} title="Intelligence">
          {intel.intentScore != null && (
            <div className="flex items-end gap-2">
              <span
                className={cn(
                  "text-3xl font-semibold tabular-nums",
                  hot ? "text-primary" : "text-foreground"
                )}
              >
                {intel.intentScore}
              </span>
              <span className="text-xs text-muted-foreground pb-1">intent score</span>
            </div>
          )}
          {intel.personalisedOpener && (
            <p className="text-foreground/90 mt-3 leading-relaxed border-l-2 border-primary/40 pl-3">
              {intel.personalisedOpener}
            </p>
          )}
          {intel.recommendedAction && (
            <p className="text-muted-foreground mt-3 text-xs flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
              {intel.recommendedAction}
            </p>
          )}
        </DetailBlock>
      )}

      {conv && (
        <DetailBlock icon={MessageSquare} title="Conversation">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Outcome · {conv.outcome ?? "—"}
          </p>
          {conv.actionItems && conv.actionItems.length > 0 && (
            <ul className="mt-3 space-y-2">
              {conv.actionItems.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-foreground/85 text-xs"
                >
                  <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {conv.transcript && conv.transcript.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto border border-border p-3 bg-card/50">
              {conv.transcript.map((t: { role: string; text: string }, i: number) => (
                <p key={i} className="text-xs leading-relaxed">
                  <span
                    className={cn(
                      "font-medium uppercase tracking-wider text-[10px]",
                      t.role === "user" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {t.role}
                  </span>
                  <span className="text-foreground/80 ml-2">{t.text}</span>
                </p>
              ))}
            </div>
          )}
        </DetailBlock>
      )}
    </div>
  );
}
