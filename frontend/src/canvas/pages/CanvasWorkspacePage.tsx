import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useBpAgentId } from "@/hooks/useBpAgentId";
import { useTenant } from "@/tenant/TenantContext";
import { ensureCanvasAvatarInitialized, preloadCanvasAvatarSdk } from "../lib/avatarSdk";
import type { SpeechLangCode } from "../hooks/useSpeechInput";
import { useUsageBalance } from "../hooks/useUsageBalance";
import { useComposerPipeline } from "../hooks/useComposerPipeline";
import { useCanvasIntegrationHealth } from "../context/IntegrationHealthContext";
import { CanvasChatColumn } from "../shell/CanvasChatColumn";
import { AvatarDock, AvatarMobileSlot } from "../shell/AvatarDock";
import { CanvasGettingStarted } from "../shell/CanvasGettingStarted";
import { canSubmitAdvisorScenario } from "../lib/workspaceFlow";

/** Chat + avatar workspace — index route under `/canvas`. */
export function CanvasWorkspacePage() {
  const { embedKey, businessId } = useTenant();
  const bpAgentId = useBpAgentId();
  const { creditsExhausted } = useUsageBalance(businessId);

  useEffect(() => {
    preloadCanvasAvatarSdk();
  }, []);

  useEffect(() => {
    if (!bpAgentId) return;
    void ensureCanvasAvatarInitialized(bpAgentId).catch(() => {
      /* surfaced again when the user clicks send */
    });
  }, [bpAgentId]);
  const integrationHealth = useCanvasIntegrationHealth();
  const [avatarOpen, setAvatarOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<SpeechLangCode>("en");

  const {
    send,
    prewarm,
    sending,
    error,
    lastOpener,
    streamingOpener,
    lastScenario,
    lastRun,
    sessionActive,
    setSessionActive,
    fallbackMessage,
  } = useComposerPipeline(embedKey);

  const displayOpener = streamingOpener ?? lastOpener;
  const showWelcome = !sessionActive && !displayOpener && !sending;

  const intelligenceReady = integrationHealth.canRunIntelligence;
  const fullStackReady = integrationHealth.canRunLive;

  const sendAllowed = useMemo(
    () =>
      canSubmitAdvisorScenario({
        hasBusinessId: Boolean(businessId),
        intelligenceReady,
        creditsExhausted,
        promptTrimmedLength: prompt.trim().length,
      }),
    [businessId, intelligenceReady, creditsExhausted, prompt]
  );

  async function handleSend() {
    if (!sendAllowed) return;
    flushSync(() => {
      setAvatarOpen(true);
      setSessionActive(true);
    });
    try {
      await send(prompt, bpAgentId || undefined, language);
    } catch {
      /* error + session reset handled in useComposerPipeline */
    }
  }

  const avatarProps = {
    open: avatarOpen,
    onClose: () => setAvatarOpen(false),
    sessionActive,
    fallbackMessage,
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CanvasGettingStarted health={integrationHealth} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <CanvasChatColumn
          prompt={prompt}
          onPromptChange={setPrompt}
          onSend={() => void handleSend()}
          sending={sending}
          disabled={!businessId || !intelligenceReady}
          stackReady={intelligenceReady}
          fullStackReady={fullStackReady}
          creditsExhausted={creditsExhausted}
          lastOpener={displayOpener}
          lastScenario={lastScenario}
          lastRun={lastRun}
          onPrewarm={prewarm}
          language={language}
          onLanguageChange={setLanguage}
          error={error}
          showWelcome={showWelcome}
          sessionActive={sessionActive}
          avatarOpen={avatarOpen}
          onToggleAvatar={() => setAvatarOpen((o) => !o)}
          mobileAvatarSlot={<AvatarMobileSlot {...avatarProps} />}
        />
        <AvatarDock sessionActive={sessionActive} fallbackMessage={fallbackMessage} />
      </div>
    </div>
  );
}
