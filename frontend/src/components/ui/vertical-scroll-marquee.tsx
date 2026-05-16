import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerticalScrollItem = {
  id: string;
  label: string;
  description: string;
  embedKey: string;
  icon: LucideIcon;
};

type Props = {
  items: VerticalScrollItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  duration?: number;
};

export function VerticalScrollMarquee({
  items,
  selectedId,
  onSelect,
  duration = 28,
}: Props) {
  const loop = [...items, ...items];

  return (
    <div
      className="group/marquee relative w-full overflow-hidden py-2"
      style={
        {
          "--marquee-duration": `${duration}s`,
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        } as CSSProperties
      }
    >
      <div className="flex w-max gap-4 animate-vertical-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((item, index) => {
          const Icon = item.icon;
          const isActive = selectedId === item.id;
          return (
            <button
              key={`${item.id}-${index}`}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "shrink-0 flex items-center gap-3 border px-5 py-3 transition-all duration-300",
                "min-w-[220px] sm:min-w-[260px] text-left",
                isActive
                  ? "border-primary/60 bg-card shadow-lg shadow-primary/10 scale-[1.02] ring-1 ring-primary/20"
                  : "border-border bg-card/60 hover:border-primary/25 hover:bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center border shrink-0",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card-elevated text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground whitespace-nowrap">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
