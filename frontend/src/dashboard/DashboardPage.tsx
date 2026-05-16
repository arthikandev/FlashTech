import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";
import type { Business } from "../convex/types";
import { LiveSessions } from "./LiveSessions";
import { SessionDetail } from "./SessionDetail";

const EMBED_KEYS = [
  { key: "seylan-demo", label: "Seylan Bank" },
  { key: "cloudmetrics-demo", label: "CloudMetrics" },
  { key: "coral-demo", label: "Coral Resort" },
] as const;

export function DashboardPage() {
  const [embedKey, setEmbedKey] = useState<string>("seylan-demo");
  const [selectedVisitorId, setSelectedVisitorId] = useState<Id<"visitors"> | null>(
    null
  );

  const business = useQuery(api.businesses.getByEmbedKey, { embedKey }) as
    | Business
    | null
    | undefined;
  const businessId = business?._id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Live dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Reactive sessions from Convex — open a demo site, then reload to see return
          visitors.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm max-w-xs">
        <span className="text-slate-400">Business</span>
        <select
          value={embedKey}
          onChange={(e) => {
            setEmbedKey(e.target.value);
            setSelectedVisitorId(null);
          }}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
        >
          {EMBED_KEYS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-medium text-slate-300 mb-3">Sessions</h2>
          <LiveSessions
            businessId={businessId}
            selectedVisitorId={selectedVisitorId}
            onSelect={setSelectedVisitorId}
          />
        </section>
        <section className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Detail</h2>
          <SessionDetail visitorId={selectedVisitorId} />
        </section>
      </div>
    </div>
  );
}
