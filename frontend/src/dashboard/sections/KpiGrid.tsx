import { Bot, BrainCircuit, Percent, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LiveSession } from "@/convex/types";

type Props = {
  sessions: LiveSession[] | undefined;
};

export function KpiGrid({ sessions }: Props) {
  if (sessions === undefined) {
    return <LoadingState variant="card" rows={5} />;
  }

  const list = sessions;
  if (list.length === 0) {
    return (
      <EmptyState
        preset="no-data"
        title="No visitor activity yet"
        description="Embed PresenceIQ on your site or open a demo to see live KPIs."
      />
    );
  }
  const withScore = list.filter((s) => s.intentScore != null);
  const avgIntent =
    withScore.length > 0
      ? Math.round(withScore.reduce((a, s) => a + (s.intentScore ?? 0), 0) / withScore.length)
      : null;
  const conversations = list.filter((s) => s.hasConversation).length;
  const hotRate =
    list.length > 0
      ? Math.round((list.filter((s) => (s.intentScore ?? 0) >= 80).length / list.length) * 100)
      : 0;
  const converted = list.filter((s) => s.conversationOutcome === "converted").length;
  const conversionRate =
    conversations > 0 ? Math.round((converted / conversations) * 100) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        value={list.length > 0 ? list.length.toLocaleString() : "—"}
        label="Live visitors"
        icon={Users}
      />
      <StatCard
        value={conversations > 0 ? conversations.toLocaleString() : "—"}
        label="AI conversations"
        icon={Bot}
      />
      <StatCard
        value={list.length > 0 ? `${hotRate}%` : "—"}
        label="Hot lead rate"
        icon={TrendingUp}
      />
      <StatCard
        value={avgIntent != null ? `${avgIntent}/100` : "—"}
        label="Avg intent score"
        icon={BrainCircuit}
      />
      <StatCard
        value={conversionRate != null ? `${conversionRate}%` : "—"}
        label="Conversion rate"
        icon={Percent}
      />
    </div>
  );
}
