import type { LiveSession } from "@/convex/types";

export const HOT_LEAD_THRESHOLD = 80;

export type KpiSnapshot = {
  liveVisitors: number;
  conversations: number;
  hotLeadRate: number | null;
  avgIntent: number | null;
  conversionRate: number | null;
};

export function computeKpiSnapshot(sessions: LiveSession[]): KpiSnapshot {
  const list = sessions;
  if (list.length === 0) {
    return {
      liveVisitors: 0,
      conversations: 0,
      hotLeadRate: null,
      avgIntent: null,
      conversionRate: null,
    };
  }

  const withScore = list.filter((s) => s.intentScore != null);
  const avgIntent =
    withScore.length > 0
      ? Math.round(withScore.reduce((a, s) => a + (s.intentScore ?? 0), 0) / withScore.length)
      : null;
  const conversations = list.filter((s) => s.hasConversation).length;
  const hotRate = Math.round(
    (list.filter((s) => (s.intentScore ?? 0) >= HOT_LEAD_THRESHOLD).length / list.length) * 100
  );
  const converted = list.filter((s) => s.conversationOutcome === "converted").length;
  const conversionRate =
    conversations > 0 ? Math.round((converted / conversations) * 100) : null;

  return {
    liveVisitors: list.length,
    conversations,
    hotLeadRate: hotRate,
    avgIntent,
    conversionRate,
  };
}
