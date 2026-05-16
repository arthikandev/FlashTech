import { Fragment } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LiveSession } from "@/convex/types";

type Props = {
  sessions: LiveSession[] | undefined;
};

const INTENT_BUCKETS = ["0–39", "40–69", "70–89", "90+"] as const;
const RETURN_BUCKETS = ["1", "2–3", "4+"] as const;

function bucketIntent(score?: number): number {
  if (score == null) return 0;
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 40) return 1;
  return 0;
}

function bucketReturn(n: number): number {
  if (n >= 4) return 2;
  if (n >= 2) return 1;
  return 0;
}

function cellColor(intentIdx: number, count: number): string {
  if (count === 0) return "bg-muted/30";
  if (intentIdx === 0) return "bg-blue-500/30";
  if (intentIdx === 1) return "bg-violet-500/35";
  if (intentIdx === 2) return "bg-emerald-500/40";
  return "bg-rose-500/35";
}

export function IntentHeatmap({ sessions }: Props) {
  if (sessions === undefined) {
    return (
      <section id="heatmap">
        <SectionHeading
          title="AI Intent Heatmap"
          subtitle="Engagement zones by intent score and visit frequency"
          align="left"
          compact
        />
        <LoadingState variant="inline" label="Loading intent data…" />
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section id="heatmap">
        <SectionHeading
          title="AI Intent Heatmap"
          subtitle="Engagement zones by intent score and visit frequency"
          align="left"
          compact
        />
        <EmptyState preset="no-data" title="No intent data yet" />
      </section>
    );
  }

  const grid: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (const s of sessions ?? []) {
    const i = bucketIntent(s.intentScore);
    const r = bucketReturn(s.returnCount);
    grid[i][r] += 1;
  }

  const max = Math.max(1, ...grid.flat());

  return (
    <section id="heatmap">
      <SectionHeading
        title="AI Intent Heatmap"
        subtitle="Engagement zones by intent score and visit frequency"
        align="left"
        compact
      />
      <div className="mt-2 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 text-xs">
          <div />
          {RETURN_BUCKETS.map((b) => (
            <div key={b} className="text-center text-gray-600 pb-1">
              {b} visits
            </div>
          ))}
          {INTENT_BUCKETS.map((label, i) => (
            <Fragment key={label}>
              <div className="flex items-center text-gray-500 pr-2">{label}</div>
              {grid[i].map((count, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (i * 3 + j) * 0.05 }}
                  className={`flex aspect-square items-center justify-center rounded-lg border border-border/50 font-medium ${cellColor(i, count)}`}
                  style={{ opacity: 0.4 + (count / max) * 0.6 }}
                  title={`${count} visitors`}
                >
                  {count > 0 ? count : ""}
                </motion.div>
              ))}
            </Fragment>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-blue-500/50" /> Low intent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-violet-500/50" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-emerald-500/50" /> High conversion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-rose-500/50" /> Churn risk
          </span>
        </div>
      </div>
    </section>
  );
}
