import { useEffect, useMemo, useRef, useState } from "react";
import { deriveFeedEvents, type FeedEvent } from "@/lib/dashboard/feedEvents";
import type { LiveSession, SessionDetailResult } from "@/convex/types";

export type { FeedEvent };

export function useAiFeedEvents(
  sessions: LiveSession[] | undefined,
  detail: SessionDetailResult | null | undefined
) {
  const events = useMemo(() => deriveFeedEvents(sessions, detail), [sessions, detail]);
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set());
  const prevLen = useRef(0);

  useEffect(() => {
    if (events.length > prevLen.current) {
      const newest = events.slice(0, events.length - prevLen.current);
      setPulseIds((prev) => {
        const next = new Set(prev);
        for (const e of newest) next.add(e.id);
        return next;
      });
      const t = window.setTimeout(() => {
        setPulseIds((prev) => {
          const next = new Set(prev);
          for (const e of newest) next.delete(e.id);
          return next;
        });
      }, 2400);
      prevLen.current = events.length;
      return () => window.clearTimeout(t);
    }
    prevLen.current = events.length;
  }, [events]);

  return { events, pulseIds };
}
