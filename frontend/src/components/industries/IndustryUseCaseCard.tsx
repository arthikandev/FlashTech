import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  badge: string;
  stat: string;
  description: string;
  icon: LucideIcon;
  onSelectPrompt?: () => void;
  compact?: boolean;
  className?: string;
};

export function IndustryUseCaseCard({
  name,
  badge,
  stat,
  description,
  icon: Icon,
  onSelectPrompt,
  compact = false,
  className,
}: Props) {
  const badgeUpper = badge.toUpperCase();

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors",
        "hover:border-primary/30 hover:bg-card-elevated/80",
        compact && "p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg border border-border bg-background/60",
            compact ? "size-9" : "size-10"
          )}
        >
          <Icon className={cn("text-foreground/80", compact ? "size-4" : "size-5")} strokeWidth={1.5} />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground text-right leading-tight max-w-[52%]">
          {badgeUpper}
        </span>
      </div>

      <h3
        className={cn(
          "font-serif tracking-tight text-foreground mt-4",
          compact ? "text-lg" : "text-xl sm:text-2xl"
        )}
      >
        {name}
      </h3>

      <p className={cn("mt-2 text-muted-foreground", compact ? "text-xs" : "text-sm")}>{stat}</p>

      <p
        className={cn(
          "mt-3 flex-1 leading-relaxed text-muted-foreground/90",
          compact ? "text-xs line-clamp-3" : "text-sm"
        )}
      >
        {description}
      </p>

      {onSelectPrompt ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSelectPrompt}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-foreground"
          >
            Try in Canvas
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      ) : null}
    </article>
  );
}
