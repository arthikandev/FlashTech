import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OnboardingStepId } from "../types";

type Props = {
  steps: { id: OnboardingStepId; label: string }[];
  currentIndex: number;
};

export function StepProgress({ steps, currentIndex }: Props) {
  const progress = steps.length > 1 ? currentIndex / (steps.length - 1) : 1;

  return (
    <div className="space-y-3">
      <motion.div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        initial={false}
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 8)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </motion.div>
      <ol className="flex w-full items-center justify-between gap-1 sm:gap-2">
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
    </div>
  );
}
