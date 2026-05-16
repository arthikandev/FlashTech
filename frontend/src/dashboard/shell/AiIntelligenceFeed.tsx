import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeedEvent } from "@/lib/dashboard/feedEvents";

const TAG_VARIANT: Record<FeedEvent["tag"], "default" | "secondary" | "outline" | "destructive"> = {
  AI: "default",
  CRM: "secondary",
  Avatar: "outline",
  Sales: "destructive",
};

type Props = {
  events: FeedEvent[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AiIntelligenceFeed({ events, collapsed, onToggleCollapse }: Props) {
  if (collapsed) {
    return (
      <div className="flex h-full w-10 flex-col items-center border-l border-border bg-sidebar py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Expand feed"
        >
          <ChevronLeft />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Intelligence feed
          </p>
          <p className="text-xs text-foreground">Real-time events</p>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-md p-1 text-muted-foreground hover:bg-accent xl:block"
            aria-label="Collapse feed"
          >
            <ChevronRight />
          </button>
        )}
      </div>
      <ScrollArea className="flex-1 p-2">
        {events.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Events appear as visitors interact.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {events.map((ev) => (
                <motion.li
                  key={ev.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-border bg-card px-2.5 py-2"
                >
                  <Badge variant={TAG_VARIANT[ev.tag]} className="text-[9px] uppercase">
                    {ev.tag}
                  </Badge>
                  <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{ev.message}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
