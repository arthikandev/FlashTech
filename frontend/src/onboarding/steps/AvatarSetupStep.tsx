import { Label } from "@/components/ui/label";
import {
  PERSONALITY_OPTIONS,
  TONE_OPTIONS,
  VOICE_OPTIONS,
} from "../constants";
import { onboardingSelectClass } from "../inputStyles";
import { OnboardingShell } from "../components/OnboardingShell";
import type { OnboardingData } from "../types";

type Props = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
};

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={onboardingSelectClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AvatarSetupStep({ data, update, onBack, onContinue, showBack }: Props) {
  return (
    <OnboardingShell
      title="Avatar setup"
      description="Configure how your AI avatar sounds and presents itself to visitors."
      onBack={onBack}
      onContinue={onContinue}
      showBack={showBack}
    >
      <SelectField
        id="voice"
        label="Voice"
        value={data.voice}
        options={VOICE_OPTIONS}
        onChange={(voice) => update({ voice })}
      />
      <SelectField
        id="personality"
        label="Personality"
        value={data.personality}
        options={PERSONALITY_OPTIONS}
        onChange={(personality) => update({ personality })}
      />
      <SelectField
        id="tone"
        label="Tone"
        value={data.tone}
        options={TONE_OPTIONS}
        onChange={(tone) => update({ tone })}
      />
    </OnboardingShell>
  );
}
