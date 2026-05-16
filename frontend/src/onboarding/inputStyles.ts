import { cn } from "@/lib/utils";

export const onboardingInputClass = cn(
  "w-full h-[3.25rem] border-0 bg-secondary/90 dark:bg-muted",
  "text-foreground placeholder:text-muted-foreground text-base",
  "outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40 transition-shadow"
);

export const onboardingSelectClass = cn(onboardingInputClass, "px-4");

export const onboardingTextareaClass = cn(
  "w-full min-h-[6rem] px-4 py-3 border-0 bg-secondary/90 dark:bg-muted",
  "text-foreground placeholder:text-muted-foreground text-base resize-y",
  "outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40 transition-shadow"
);
