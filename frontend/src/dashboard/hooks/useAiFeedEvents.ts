import { useEffect, useMemo, useRef, useState } from "react";
import type { LiveSession, SessionDetailResult } from "@/convex/types";

export type FeedEvent = {
  id: string;
  tag: "AI" | "CRM" | "Avatar" | "Sales";
  message: string;
  at: number;
};

function deriveEvents(
  sessions: LiveSession[] | undefined,
  detail: SessionDetailResult | null | undefined
): FeedEvent[] {
  const events: FeedEvent[] = [];
  const list = sessions ?? [];

  for (const s of list.slice(0, 8)) {
    const name = s.name ?? s.fingerprint.slice(0, 10);
    if ((s.intentScore ?? 0) >= 80) {
      events.push({
        id: `hot-${s.visitorId}`,
        tag: "AI",
        message: `Intent spike detected for ${name} (${s.intentScore}/100).`,
        at: s.lastSeenAt,
      });
    }
    if (s.crmAccountType) {
      events.push({
        id: `crm-${s.visitorId}`,
        tag: "CRM",
        message: `${s.crmAccountType} visitor ${name} on site.`,
        at: s.lastSeenAt,
      });
    }
    if (s.hasConversation) {
      events.push({
        id: `avatar-${s.visitorId}`,
        tag: "Avatar",
        message: `Avatar session active for ${name}.`,
        at: s.lastSeenAt,
      });
    }
    if (s.crmChurnRisk === "high") {
      events.push({
        id: `churn-${s.visitorId}`,
        tag: "AI",
        message: `Churn risk elevated for ${name}.`,
        at: s.lastSeenAt,
      });
    }
    if (s.recommendedAction) {
      events.push({
        id: `rec-${s.visitorId}`,
        tag: "Sales",
        message: s.recommendedAction,
        at: s.lastSeenAt,
      });
    }
  }

  if (detail?.intelligence?.recommendedAction) {
    const n = detail.visitor.crmData?.name ?? "selected visitor";
    events.push({
      id: `detail-rec`,
      tag: "Sales",
      message: `${n}: ${detail.intelligence.recommendedAction}`,
      at: Date.now(),
    });
  }

  return events
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);
}

export function useAiFeedEvents(
  sessions: LiveSession[] | undefined,
  detail: SessionDetailResult | null | undefined
) {
  const prevRef = useRef<Map<string, number>>(new Map());
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set());

  const events = useMemo(
    () => deriveEvents(sessions, detail),
    [sessions, detail]
  );

  useEffect(() => {
    const next = new Map<string, number>();
    const updated = new Set<string>();
    for (const s of sessions ?? []) {
      const prev = prevRef.current.get(s.visitorId);
      next.set(s.visitorId, s.lastSeenAt);
      if (prev != null && prev < s.lastSeenAt) {
        updated.add(s.visitorId);
      }
    }
    prevRef.current = next;
    if (updated.size > 0) {
      setPulseIds(updated);
      const t = setTimeout(() => setPulseIds(new Set()), 1200);
      return () => clearTimeout(t);
    }
  }, [sessions]);

  return { events, pulseIds };
}
