import { ArrowUp, UserRound } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { t } from "../i18n/canvas.en";
import { ComposerMicButton } from "./ComposerMicButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
  creditsExhausted: boolean;
  onToggleAvatar: () => void;
  avatarOpen: boolean;
  showAvatarToggle?: boolean;
};

export function CanvasComposer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  creditsExhausted,
  onToggleAvatar,
  avatarOpen,
  showAvatarToggle = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefixRef = useRef("");
  const sessionRef = useRef("");
  const [focused, setFocused] = useState(false);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  const handleVoiceTranscript = useCallback(
    (chunk: string, isFinal: boolean) => {
      sessionRef.current = chunk;
      const base = prefixRef.current.trimEnd();
      const merged = base ? `${base} ${chunk.trim()}` : chunk.trim();
      onChange(merged);
      if (isFinal) {
        prefixRef.current = merged;
        sessionRef.current = "";
      }
      requestAnimationFrame(handleInput);
    },
    [onChange, handleInput]
  );

  const handleListenStart = useCallback(() => {
    prefixRef.current = value;
    sessionRef.current = "";
  }, [value]);

  const canSend = value.trim().length > 0 && !sending && !disabled && !creditsExhausted;
  const inputDisabled = disabled || creditsExhausted;

  return (
        <div className="px-4 py-4 sm:px-6">
      <div
        className={cn(
          "relative mx-auto w-full max-w-2xl border bg-card shadow-sm transition-shadow",
          focused ? "border-primary ring-2 ring-primary/20" : "border-border"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleInput();
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          rows={2}
          placeholder={t("composer.placeholder")}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={inputDisabled}
          aria-label={t("composer.placeholder")}
        />

        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <ComposerMicButton
            disabled={inputDisabled}
            onTranscript={handleVoiceTranscript}
            onListenStart={handleListenStart}
          />
          {showAvatarToggle ? (
            <button
              type="button"
              onClick={onToggleAvatar}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition-colors lg:hidden",
                avatarOpen
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              aria-label={t("composer.avatarToggle")}
              aria-pressed={avatarOpen}
            >
              <UserRound className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="absolute bottom-3 right-4">
          <ShimmerButton
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="flex size-11 items-center justify-center rounded-full p-0"
            background="var(--primary)"
            shimmerColor="var(--primary-foreground)"
            borderRadius="9999px"
            shimmerDuration="2.5s"
            aria-label={t("composer.send")}
          >
            <ArrowUp className="size-5 text-[var(--primary-foreground)]" />
          </ShimmerButton>
        </div>
      </div>

      {creditsExhausted ? (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-amber-200/90" role="alert">
          {t("composer.creditsExhausted")}
        </p>
      ) : null}
      {sending ? (
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          {t("composer.sending")}
        </p>
      ) : null}
    </div>
  );
}
