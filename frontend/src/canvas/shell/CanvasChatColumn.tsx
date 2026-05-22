import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "@/tenant/TenantContext";
import { CanvasWelcome } from "./CanvasWelcome";
import { CanvasComposer } from "./CanvasComposer";
import { CanvasPipelineStatus } from "./CanvasPipelineStatus";
import { CanvasWorkflowExplainer } from "./CanvasWorkflowExplainer";
import type { PipelineRunMeta } from "../hooks/useComposerPipeline";
import type { SpeechLangCode } from "../hooks/useSpeechInput";
import { t } from "../i18n/canvas.en";

type Props = {
  prompt: string;
  onPromptChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
  stackReady?: boolean;
  /** When false but stackReady true, show BP limitation banner (Convex+OpenAI OK, BP probe failed). */
  fullStackReady?: boolean;
  creditsExhausted: boolean;
  lastOpener: string | null;
  lastScenario?: string | null;
  lastRun?: PipelineRunMeta | null;
  onPrewarm?: () => void;
  language?: SpeechLangCode;
  onLanguageChange?: (lang: SpeechLangCode) => void;
  error: string | null;
  showWelcome: boolean;
  /** Live advisor session started (pipeline / avatar path). */
  sessionActive: boolean;
  avatarOpen: boolean;
  onToggleAvatar: () => void;
  /** Rendered between scroll area and composer on mobile (e.g. avatar panel). */
  mobileAvatarSlot?: ReactNode;
};

export function CanvasChatColumn({
  prompt,
  onPromptChange,
  onSend,
  sending,
  disabled,
  stackReady = true,
  fullStackReady = true,
  creditsExhausted,
  lastOpener,
  lastScenario,
  lastRun,
  onPrewarm,
  language,
  onLanguageChange,
  error,
  showWelcome,
  sessionActive,
  avatarOpen,
  onToggleAvatar,
  mobileAvatarSlot,
}: Props) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {showWelcome ? (
          <>
            <CanvasWelcome onPickPrompt={onPromptChange} activePrompt={prompt} />
            <CanvasWorkflowExplainer />
          </>
        ) : null}
        {lastOpener ? (
          <div className="flex min-h-full flex-col gap-4 px-4 py-8 sm:px-8">
            {lastScenario ? (
              <div className="mx-auto flex w-full max-w-xl justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-70">
                    Your scenario
                  </p>
                  <p className="mt-0.5 leading-snug">{lastScenario}</p>
                </div>
              </div>
            ) : null}
            <div className="mx-auto w-full max-w-xl">
              <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Personalised opener
              </p>
              <p className="mx-auto mt-3 max-w-xl text-center font-serif text-xl leading-relaxed text-foreground italic sm:text-2xl">
                &ldquo;{lastOpener}&rdquo;
              </p>
            </div>
          </div>
        ) : null}
        {!showWelcome && !lastOpener ? (
          <div className="flex min-h-full items-center justify-center p-8">
            <p className="text-center text-sm text-muted-foreground">
              {sending
                ? t("composer.sending")
                : error
                  ? t("composer.pipelineFailedMiddle")
                  : sessionActive
                    ? t("composer.awaitingOpener")
                    : t("composer.idleHint")}
            </p>
          </div>
        ) : null}
      </div>

      {mobileAvatarSlot ? (
        <div className="shrink-0 lg:hidden">{mobileAvatarSlot}</div>
      ) : null}

      <div className="shrink-0 border-t border-border bg-card/95 backdrop-blur-sm">
        {!stackReady ? (
          <p className="border-b border-border px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
            {t("composer.setupRequired")}{" "}
            <Link to={`/canvas/help${qs}`} className="font-medium text-primary hover:underline">
              {t("composer.setupLink")}
            </Link>
          </p>
        ) : !fullStackReady ? (
          <p className="border-b border-border bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
            {t("composer.bpLimited")}{" "}
            <Link to={`/canvas/help${qs}`} className="font-medium text-primary hover:underline">
              {t("composer.setupLink")}
            </Link>
          </p>
        ) : null}
        <CanvasComposer
          value={prompt}
          onChange={onPromptChange}
          onSend={onSend}
          onPrewarm={onPrewarm}
          sending={sending}
          disabled={disabled}
          creditsExhausted={creditsExhausted}
          onToggleAvatar={onToggleAvatar}
          avatarOpen={avatarOpen}
          showAvatarToggle
          language={language}
          onLanguageChange={onLanguageChange}
        />
        <div className="px-4 pb-3">
          <CanvasPipelineStatus
            sending={sending}
            sessionActive={sessionActive}
            errorMessage={error}
            fallbackMessage={null}
            lastRun={lastRun}
          />
        </div>
        {error ? (
          <p className="px-4 pb-3 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
