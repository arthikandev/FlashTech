import { cn } from "@/lib/utils";
import type { OnboardingStepId } from "../types";

type Props = {
  steps: { id: OnboardingStepId; label: string }[];
  currentIndex: number;
};

export function StepProgress({ steps, currentIndex }: Props) {
  return (
    <ol className="flex items-center justify-between gap-1 sm:gap-2 w-full">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.id} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-xs font-semibold border transition-colors shrink-0",
                done && "bg-primary text-[var(--primary-foreground)] border-primary",
                active && !done && "bg-card-elevated text-foreground border-primary ring-2 ring-primary/30",
                !done && !active && "bg-muted text-muted-foreground border-border"
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "text-[9px] sm:text-[10px] uppercase tracking-wider text-center truncate w-full",
                active ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
