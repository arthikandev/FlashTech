import { useCallback, useEffect, useState } from "react";
import { ensureCanvasAvatarInitialized } from "../lib/avatarSdk";
import { resolveBackendBaseUrl } from "@/lib/backendUrl";

export type TestSessionResult = {
  visitorId: string;
  businessId: string;
  fingerprint: string;
};

type PipelineCompleteDetail = {
  intelligence?: {
    personalisedOpener?: string;
  };
};

export function useComposerPipeline(embedKey: string) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOpener, setLastOpener] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const onComplete = (e: Event) => {
      const detail = (e as CustomEvent<PipelineCompleteDetail>).detail;
      const opener = detail?.intelligence?.personalisedOpener;
      if (opener) setLastOpener(opener);
      setSending(false);
    };
    const onPipelineError = (e: Event) => {
      const err = (e as CustomEvent<{ error?: string }>).detail?.error;
      setError(err ?? "Pipeline failed");
      setSending(false);
    };
    const onFallback = (e: Event) => {
      const reason = (e as CustomEvent).detail?.reason ?? "Avatar unavailable";
      setFallbackMessage(String(reason));
      setSending(false);
    };

    window.addEventListener("presenceiq:pipeline-complete", onComplete);
    window.addEventListener("presenceiq:pipeline-error", onPipelineError);
    window.addEventListener("presenceiq:avatar-fallback", onFallback);
    return () => {
      window.removeEventListener("presenceiq:pipeline-complete", onComplete);
      window.removeEventListener("presenceiq:pipeline-error", onPipelineError);
      window.removeEventListener("presenceiq:avatar-fallback", onFallback);
    };
  }, []);

  const send = useCallback(
    async (operatorMessage: string, bpAgentId?: string) => {
      const base = await resolveBackendBaseUrl();
      setSending(true);
      setError(null);
      setFallbackMessage(null);
      setLastOpener(null);

      try {
        await ensureCanvasAvatarInitialized(bpAgentId);

        const sessionRes = await fetch(`${base}/api/canvas/operator-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedKey }),
        });
        const sessionBody = (await sessionRes.json()) as {
          success?: boolean;
          message?: string;
          data?: TestSessionResult;
        };
        if (!sessionRes.ok || !sessionBody.success || !sessionBody.data) {
          throw new Error(sessionBody.message ?? "Failed to start operator session");
        }

        const { visitorId, businessId } = sessionBody.data;
        const sessionId = `canvas-${Date.now()}`;
        setSessionActive(true);

        const trimmedOpener = operatorMessage.trim();
        window.__piq_last = {
          visitorId,
          businessId,
          sessionId,
          ...(trimmedOpener ? { operatorMessage: trimmedOpener } : {}),
        };

        window.dispatchEvent(
          new CustomEvent("presenceiq:ready", {
            detail: {
              visitorId,
              businessId,
              sessionId,
              operatorMessage: operatorMessage.trim() || undefined,
            },
          })
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Send failed";
        setError(msg);
        setSending(false);
        setSessionActive(false);
        throw err;
      }
    },
    [embedKey]
  );

  return {
    send,
    sending,
    error,
    lastOpener,
    sessionActive,
    setSessionActive,
    fallbackMessage,
  };
}
