import { useQuery } from "convex/react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";

type Session = {
  visitorId: Id<"visitors">;
  fingerprint: string;
  name?: string;
  intentScore?: number;
  personalisedOpener?: string;
  recommendedAction?: string;
  returnCount: number;
  lastSeenAt: number;
  language?: string;
};

type Props = {
  businessId: Id<"businesses"> | undefined;
  selectedVisitorId: Id<"visitors"> | null;
  onSelect: (visitorId: Id<"visitors">) => void;
};

export function LiveSessions({ businessId, selectedVisitorId, onSelect }: Props) {
  const sessions = useQuery(
    api.intelligence.listLiveSessions,
    businessId ? { businessId } : "skip"
  ) as Session[] | undefined;

  if (!businessId) {
    return (
      <p className="text-slate-400 text-sm">Select a business to load sessions.</p>
    );
  }

  if (sessions === undefined) {
    return <p className="text-slate-400 text-sm">Loading sessions…</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        No visitors yet. Open a demo site with the embed script, then reload.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
      {sessions.map((s) => (
        <li key={s.visitorId}>
          <button
            type="button"
            onClick={() => onSelect(s.visitorId)}
            className={`w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors ${
              selectedVisitorId === s.visitorId ? "bg-slate-800" : ""
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-medium text-white">
                  {s.name ?? s.fingerprint.slice(0, 12)}
                </p>
                <p className="text-xs text-slate-400">
                  Returns: {s.returnCount} · {new Date(s.lastSeenAt).toLocaleTimeString()}
                </p>
              </div>
              {s.intentScore != null && (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    s.intentScore > 80
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {s.intentScore}
                </span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
