import type { ReactNode } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showBack?: boolean;
  footerExtra?: ReactNode;
};

export function OnboardingShell({
  children,
  title,
  description,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  showBack = true,
  footerExtra,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      <div className="space-y-5">{children}</div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "h-12 px-6 text-sm font-medium border border-border bg-card",
              "text-foreground hover:bg-card-elevated transition-colors"
            )}
          >
            Back
          </button>
        )}
        {onContinue && (
          <ShimmerButton
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className={cn(
              "h-12 text-sm font-semibold text-[var(--primary-foreground)]",
              showBack && onBack ? "flex-1" : "w-full"
            )}
            background="var(--primary)"
            shimmerColor="var(--primary-foreground)"
            borderRadius="0"
            shimmerDuration="2.5s"
          >
            {continueLabel}
          </ShimmerButton>
        )}
        {footerExtra}
      </div>
    </div>
  );
}
