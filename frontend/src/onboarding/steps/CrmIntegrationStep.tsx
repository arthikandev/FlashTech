import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CRM_OPTIONS } from "../constants";
import { OnboardingShell } from "../components/OnboardingShell";
import type { CrmProvider, OnboardingData } from "../types";

type Props = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
};

export function CrmIntegrationStep({ data, update, onBack, onContinue, showBack }: Props) {
  const selected = data.crmProvider;

  return (
    <OnboardingShell
      title="CRM integration"
      description="Connect your CRM so PresenceIQ can personalise openers with live customer context."
      onBack={onBack}
      onContinue={onContinue}
      showBack={showBack}
      footerExtra={
        <button
          type="button"
          onClick={() => {
            update({ crmProvider: null });
            onContinue();
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline sm:ml-auto sm:self-center"
        >
          Skip for now
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {CRM_OPTIONS.map((crm) => {
          const active = selected === crm.id;
          return (
            <button
              key={crm.id}
              type="button"
              onClick={() => update({ crmProvider: crm.id as CrmProvider })}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 border text-left transition-all",
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-foreground/30"
              )}
            >
              {active && (
                <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center bg-primary text-[var(--primary-foreground)]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="font-semibold text-foreground">{crm.label}</span>
              <span className="text-xs text-muted-foreground">{crm.description}</span>
              {active && (
                <span className="text-[10px] uppercase tracking-widest text-primary mt-1">
                  Connected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}
