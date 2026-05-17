import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SignupMacroStep = 1 | 2 | 3;

const STEPS = [
  { step: 1 as const, label: "Account" },
  { step: 2 as const, label: "Workspace" },
  { step: 3 as const, label: "Onboard" },
];

type Props = {
  current: SignupMacroStep;
  className?: string;
};

export function SignupFunnelProgress({ current, className }: Props) {
  const currentIndex = current - 1;
  const progress =
    STEPS.length > 1 ? currentIndex / (STEPS.length - 1) : 1;

  return (
    <div className={cn("space-y-3", className)}>
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
        {STEPS.map(({ step, label }, i) => {
          const done = i < currentIndex;
          const active = step === current;
          return (
            <li
              key={step}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border text-[10px] font-semibold transition-colors sm:h-8 sm:w-8 sm:text-xs",
                  done &&
                    "border-primary bg-primary text-[var(--primary-foreground)]",
                  active &&
                    !done &&
                    "border-primary bg-card text-foreground ring-2 ring-primary/30",
                  !done &&
                    !active &&
                    "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? "✓" : step}
              </span>
              <span
                className={cn(
                  "w-full truncate text-center text-[9px] uppercase tracking-wider sm:text-[10px]",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}
