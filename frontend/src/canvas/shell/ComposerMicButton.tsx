import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SPEECH_LANG_OPTIONS,
  type SpeechLangCode,
  useSpeechInput,
} from "../hooks/useSpeechInput";
import { t } from "../i18n/canvas.en";

type Props = {
  disabled?: boolean;
  onTranscript: (text: string, isFinal: boolean) => void;
  onListenStart?: () => void;
  /** Controlled language code. When provided, the dropdown reflects this and
   *  changes are propagated via `onLanguageChange`. */
  language?: SpeechLangCode;
  onLanguageChange?: (next: SpeechLangCode) => void;
};

export function ComposerMicButton({
  disabled,
  onTranscript,
  onListenStart,
  language,
  onLanguageChange,
}: Props) {
  const speech = useSpeechInput(onTranscript, {
    language,
    onLanguageChange,
  });

  function handleToggle() {
    if (!speech.listening) {
      onListenStart?.();
    }
    speech.toggle();
  }

  if (!speech.supported) {
    return (
      <button
        type="button"
        disabled
        title={t("composer.voiceUnsupported")}
        className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground opacity-50"
        aria-label={t("composer.voiceUnsupported")}
      >
        <MicOff className="size-4" />
      </button>
    );
  }

  return (
    <div className="relative flex items-center gap-1">
      <select
        value={speech.lang}
        disabled={disabled || speech.listening}
        onChange={(e) => speech.setLang(e.target.value as SpeechLangCode)}
        className={cn(
          "h-8 max-w-[5.5rem] rounded-full border border-border bg-background px-2 text-[10px] font-medium text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        )}
        aria-label={t("composer.voiceLang")}
        title={t("composer.voiceLang")}
      >
        {SPEECH_LANG_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "flex size-9 items-center justify-center rounded-full border transition-colors",
          speech.listening
            ? "border-red-500/50 bg-red-500/15 text-red-600 animate-pulse dark:text-red-400"
            : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-foreground",
          disabled && "opacity-50 pointer-events-none"
        )}
        aria-label={speech.listening ? t("composer.voiceStop") : t("composer.voiceStart")}
        aria-pressed={speech.listening}
        title={
          speech.listening
            ? t("composer.voiceStop")
            : `${t("composer.voiceStart")} (${SPEECH_LANG_OPTIONS.find((o) => o.code === speech.lang)?.label})`
        }
      >
        <Mic className="size-4" />
      </button>
      {speech.error ? (
        <p className="absolute bottom-full left-0 mb-1 max-w-[200px] rounded-md border border-amber-500/30 bg-card px-2 py-1 text-[10px] text-amber-800 dark:text-amber-200">
          {speech.error}
        </p>
      ) : null}
    </div>
  );
}
