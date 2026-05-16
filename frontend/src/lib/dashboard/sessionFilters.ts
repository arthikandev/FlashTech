import type { LiveSession } from "@/convex/types";

export function filterSessions(sessions: LiveSession[], search: string): LiveSession[] {
  const q = search.trim().toLowerCase();
  if (!q) return sessions;
  return sessions.filter((s) => {
    const name = (s.name ?? "").toLowerCase();
    const fp = s.fingerprint.toLowerCase();
    const action = (s.recommendedAction ?? "").toLowerCase();
    return name.includes(q) || fp.includes(q) || action.includes(q);
  });
}

export function sortSessionsByIntent(sessions: LiveSession[]): LiveSession[] {
  return [...sessions].sort((a, b) => {
    const ai = a.intentScore ?? 0;
    const bi = b.intentScore ?? 0;
    if (bi !== ai) return bi - ai;
    return b.lastSeenAt - a.lastSeenAt;
  });
}
