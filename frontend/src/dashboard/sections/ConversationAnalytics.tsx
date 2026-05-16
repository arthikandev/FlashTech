import { lazy, Suspense, useMemo } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LiveSession, SessionDetailResult } from "@/convex/types";

const Charts = lazy(() => import("./ConversationAnalyticsCharts"));

type Props = {
  sessions: LiveSession[] | undefined;
  detail?: SessionDetailResult | null | undefined;
};

export function ConversationAnalytics({ sessions, detail }: Props) {
  const { chartData, sentimentLabel } = useMemo(() => {
    const list = sessions ?? [];
    const volume = list.slice(0, 12).map((s, i) => ({
      name: `V${i + 1}`,
      score: s.intentScore ?? 0,
    }));
    const buckets = [
      { name: "Low", count: 0 },
      { name: "Med", count: 0 },
      { name: "High", count: 0 },
      { name: "Hot", count: 0 },
    ];
    for (const s of list) {
      const sc = s.intentScore ?? 0;
      if (sc >= 80) buckets[3].count++;
      else if (sc >= 60) buckets[2].count++;
      else if (sc >= 40) buckets[1].count++;
      else buckets[0].count++;
    }

    const arc = detail?.conversation?.sentimentArc;
    const sentiment =
      arc && arc.length > 0
        ? arc.map((p) => ({ turn: p.turn, score: p.score }))
        : list
            .filter((s) => s.intentScore != null)
            .slice(0, 8)
            .map((s, i) => ({
              turn: i + 1,
              score: s.intentScore ?? 0,
            }));

    const sentimentLabel =
      arc && arc.length > 0 ? "Conversation sentiment" : "Intent by visitor";

    const outcomes = [
      { name: "Active", value: list.filter((s) => s.hasConversation).length },
      {
        name: "Intel only",
        value: list.filter((s) => !s.hasConversation && s.intentScore).length,
      },
      { name: "New", value: list.filter((s) => !s.intentScore).length },
    ].filter((o) => o.value > 0);

    return {
      chartData: { volume, buckets, sentiment, outcomes },
      sentimentLabel,
    };
  }, [sessions, detail]);

  return (
    <section id="charts">
      <SectionHeading
        title="Conversation Analytics"
        subtitle="Volume, intent distribution, sentiment, and attribution"
        align="left"
        compact
      />
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        }
      >
        <Charts data={chartData} sentimentLabel={sentimentLabel} />
      </Suspense>
    </section>
  );
}
