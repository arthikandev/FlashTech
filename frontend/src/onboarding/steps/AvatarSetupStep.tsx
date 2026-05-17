import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { resolveBpAgentId } from "@/hooks/useBpAgentId";
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
  function handleAgentIdChange(value: string) {
    const trimmed = value.trim();
    const patch: Partial<OnboardingData> = { bpAgentId: value };
    if (trimmed.length >= 8 && !data.useNativeBpAgent) {
      patch.useNativeBpAgent = true;
    }
    update(patch);
  }

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
      <div className="space-y-2">
        <Label htmlFor="bpAgentId">Beyond Presence agent ID</Label>
        <Input
          id="bpAgentId"
          value={data.bpAgentId}
          onChange={(e) => handleAgentIdChange(e.target.value)}
          placeholder="Paste from app.bey.chat → Settings"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Required for live avatar. Create an agent at{" "}
          <a
            href="https://app.bey.chat/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Beyond Presence
          </a>
          .
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
        <div className="space-y-1">
          <Label htmlFor="use-native-bp-onboard" className="text-sm font-medium">
            Use Beyond Presence agent config as-is
          </Label>
          <p className="text-xs text-muted-foreground">
            Keep prompts and knowledge you set in bey.chat; PresenceIQ will not overwrite them each
            session.
          </p>
        </div>
        <Switch
          id="use-native-bp-onboard"
          checked={data.useNativeBpAgent}
          onCheckedChange={(useNativeBpAgent) => update({ useNativeBpAgent })}
        />
      </div>
      <div className="space-y-2 border-t border-border pt-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</p>
        <BeyondPresenceFrame
          agentId={data.bpAgentId.trim() || resolveBpAgentId(undefined)}
          height={200}
          className="w-full"
        />
      </div>
    </OnboardingShell>
  );
}
