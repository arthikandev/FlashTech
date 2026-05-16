import { Label } from "@/components/ui/label";
import { INDUSTRIES } from "../constants";
import { onboardingInputClass, onboardingSelectClass } from "../inputStyles";
import { OnboardingShell } from "../components/OnboardingShell";
import type { OnboardingData } from "../types";

type Props = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
};

export function BusinessInfoStep({ data, update, onBack, onContinue, showBack }: Props) {
  const canContinue =
    data.companyName.trim().length > 0 &&
    data.website.trim().length > 0 &&
    data.industry !== "";

  return (
    <OnboardingShell
      title="Business info"
      description="Tell us about your company so we can tailor the avatar and embed."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!canContinue}
      showBack={showBack}
    >
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <input
          id="companyName"
          type="text"
          value={data.companyName}
          onChange={(e) => update({ companyName: e.target.value })}
          placeholder="Acme Corp"
          className={onboardingInputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <input
          id="website"
          type="url"
          value={data.website}
          onChange={(e) => update({ website: e.target.value })}
          placeholder="https://example.com"
          className={onboardingInputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          value={data.industry}
          onChange={(e) => update({ industry: e.target.value as OnboardingData["industry"] })}
          className={onboardingSelectClass}
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </OnboardingShell>
  );
}
