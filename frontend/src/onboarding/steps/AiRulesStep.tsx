import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GREETING_STYLE_OPTIONS, LANGUAGE_OPTIONS } from "../constants";
import { onboardingSelectClass, onboardingTextareaClass } from "../inputStyles";
import { OnboardingShell } from "../components/OnboardingShell";
import type { OnboardingData } from "../types";

type Props = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
  continueDisabled?: boolean;
  continueLabel?: string;
};

export function AiRulesStep({
  data,
  update,
  onBack,
  onContinue,
  showBack,
  continueDisabled,
  continueLabel,
}: Props) {
  const toggleLanguage = (lang: string) => {
    const has = data.languages.includes(lang);
    if (has && data.languages.length <= 1) return;
    update({
      languages: has
        ? data.languages.filter((l) => l !== lang)
        : [...data.languages, lang],
    });
  };

  return (
    <OnboardingShell
      title="AI rules"
      description="Set greeting behaviour, escalation, and supported languages."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={continueDisabled ?? data.languages.length === 0}
      continueLabel={continueLabel}
      showBack={showBack}
    >
      <div className="space-y-2">
        <Label htmlFor="greetingStyle">Greeting style</Label>
        <select
          id="greetingStyle"
          value={data.greetingStyle}
          onChange={(e) => update({ greetingStyle: e.target.value })}
          className={onboardingSelectClass}
        >
          {GREETING_STYLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="escalationRules">Escalation rules</Label>
        <textarea
          id="escalationRules"
          value={data.escalationRules}
          onChange={(e) => update({ escalationRules: e.target.value })}
          placeholder="e.g. Hand off to human when intent score > 85 or visitor asks for agent."
          className={onboardingTextareaClass}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = data.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 text-sm border transition-colors",
                  active
                    ? "bg-primary text-[var(--primary-foreground)] border-primary"
                    : "bg-card border-border text-foreground/80 hover:border-foreground/40"
                )}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}
