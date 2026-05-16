import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FeedEvent } from "../hooks/useAiFeedEvents";

const TAG_STYLES: Record<FeedEvent["tag"], string> = {
  AI: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  CRM: "text-sky-300 bg-sky-500/10 border-sky-500/25",
  Avatar: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  Sales: "text-amber-300 bg-amber-500/10 border-amber-500/25",
};

type Props = {
  events: FeedEvent[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AiIntelligenceFeed({ events, collapsed, onToggleCollapse }: Props) {
  if (collapsed) {
    return (
      <div className="flex h-full w-10 flex-col items-center border-l border-dash-border bg-dash-sidebar py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-md p-1 text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
          aria-label="Expand feed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col bg-dash-sidebar">
      <div className="flex items-center justify-between border-b border-dash-border px-3 py-3">
        <div>
          <p className="dash-label">Intelligence feed</p>
          <p className="text-xs text-dash-ink">Real-time events</p>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden xl:block rounded-md p-1 text-dash-muted hover:bg-dash-hover"
            aria-label="Collapse feed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {events.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-dash-muted">
            Events appear as visitors interact.
          </p>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {events.map((ev) => (
                <motion.li
                  key={ev.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-dash-border bg-dash-surface px-2.5 py-2"
                >
                  <span
                    className={`inline-block rounded border px-1 py-0.5 text-[9px] font-medium uppercase ${TAG_STYLES[ev.tag]}`}
                  >
                    {ev.tag}
                  </span>
                  <p className="mt-1.5 text-[11px] leading-snug text-dash-muted">{ev.message}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </aside>
  );
}
