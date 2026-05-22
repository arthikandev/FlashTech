import { useCallback, useEffect, useRef, useState } from "react";
import { cancelTts, ensureCanvasAvatarInitialized, speakViaTts } from "../lib/avatarSdk";
import { resolveBackendBaseUrl } from "@/lib/backendUrl";
import type { SpeechLangCode } from "./useSpeechInput";

export type TestSessionResult = {
  visitorId: string;
  businessId: string;
  fingerprint: string;
};

type PipelineCompleteDetail = {
  intelligence?: {
    personalisedOpener?: string;
    signals?: string[];
  };
  beyondPresence?: {
    synced?: boolean;
    partial?: boolean;
  };
  pipelineMs?: number;
};

export type PipelineRoute = "live" | "cached" | "heuristic";

export type PipelineRunMeta = {
  route: PipelineRoute;
  bpSynced: boolean;
  bpPartial: boolean;
  ttsUsed: boolean;
  pipelineMs: number | null;
};

function routeFromSignals(signals: string[] | undefined): PipelineRoute {
  if (!signals) return "live";
  if (signals.includes("heuristic_fallback")) return "heuristic";
  if (signals.includes("cached")) return "cached";
  return "live";
}

export function useComposerPipeline(embedKey: string) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOpener, setLastOpener] = useState<string | null>(null);
  const [streamingOpener, setStreamingOpener] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<PipelineRunMeta | null>(null);
  const [lastScenario, setLastScenario] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const inflightRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const prewarmRef = useRef<{
    promise: Promise<TestSessionResult> | null;
    result: TestSessionResult | null;
  }>({ promise: null, result: null });
  const ttsUsedRef = useRef(false);

  // Reset prewarm when the workspace embedKey changes.
  useEffect(() => {
    prewarmRef.current = { promise: null, result: null };
  }, [embedKey]);

  useEffect(() => {
    return () => {
      inflightRef.current?.abort();
      cancelTts();
    };
  }, []);

  useEffect(() => {
    const onComplete = (e: Event) => {
      const detail = (e as CustomEvent<PipelineCompleteDetail>).detail;
      const opener = detail?.intelligence?.personalisedOpener;
      if (opener) setLastOpener(opener);

      const route = routeFromSignals(detail?.intelligence?.signals);
      const bpSynced = detail?.beyondPresence?.synced === true;

      setLastRun({
        route,
        bpSynced,
        bpPartial: detail?.beyondPresence?.partial === true,
        ttsUsed: ttsUsedRef.current,
        pipelineMs: detail?.pipelineMs ?? null,
      });

      setSending(false);
    };
    const onPipelineError = (e: Event) => {
      const err = (e as CustomEvent<{ error?: string }>).detail?.error;
      setError(err ?? "Pipeline failed");
      setSending(false);
      setSessionActive(false);
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

  /** Pre-fetch the operator session (called on textarea focus). */
  const prewarm = useCallback(() => {
    if (!embedKey) return;
    if (prewarmRef.current.promise || prewarmRef.current.result) return;

    const run = (async () => {
      const base = await resolveBackendBaseUrl();
      const res = await fetch(`${base}/api/canvas/operator-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedKey }),
      });
      const body = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: TestSessionResult;
      };
      if (!res.ok || !body.success || !body.data) {
        throw new Error(body.message ?? "Prewarm failed");
      }
      prewarmRef.current.result = body.data;
      return body.data;
    })();

    prewarmRef.current.promise = run.catch(() => {
      // Soft-fail prewarm; send() will retry.
      prewarmRef.current = { promise: null, result: null };
      return null as never;
    });
  }, [embedKey]);

  /** Stream the opener via SSE so the bubble fills before BP speaks. */
  const streamOpener = useCallback(
    async (
      visitorId: string,
      businessId: string,
      operatorMessage: string | undefined,
      language: SpeechLangCode | undefined,
      controller: AbortController
    ): Promise<{ opener: string; route: PipelineRoute }> => {
      const base = await resolveBackendBaseUrl();
      const res = await fetch(`${base}/api/canvas/stream-opener`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, businessId, operatorMessage, language }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Stream failed (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let openerSoFar = "";
      let route: PipelineRoute = "live";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        const lines = textBuffer.split("\n");
        textBuffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trim();
          if (!line || !line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload) as
              | { type: "token"; text: string }
              | { type: "final"; intelligence: { personalisedOpener: string; signals?: string[] } }
              | { type: "fallback"; intelligence: { personalisedOpener: string; signals?: string[] }; reason: string };

            if (evt.type === "token") {
              openerSoFar += evt.text;
              setStreamingOpener(openerSoFar);
            } else if (evt.type === "final") {
              openerSoFar = evt.intelligence.personalisedOpener;
              route = routeFromSignals(evt.intelligence.signals);
              setStreamingOpener(openerSoFar);
              setLastOpener(openerSoFar);
            } else {
              openerSoFar = evt.intelligence.personalisedOpener;
              route = "heuristic";
              setStreamingOpener(openerSoFar);
              setLastOpener(openerSoFar);
              setFallbackMessage(evt.reason);
            }
          } catch {
            /* ignore malformed line */
          }
        }
      }

      return { opener: openerSoFar, route };
    },
    []
  );

  const send = useCallback(
    async (
      operatorMessage: string,
      bpAgentId?: string,
      language?: SpeechLangCode
    ) => {
      if (sendingRef.current) return;
      sendingRef.current = true;

      inflightRef.current?.abort();
      const controller = new AbortController();
      inflightRef.current = controller;

      const base = await resolveBackendBaseUrl();
      setSending(true);
      setError(null);
      setFallbackMessage(null);
      setLastOpener(null);
      setStreamingOpener(null);
      ttsUsedRef.current = false;
      cancelTts();
      const trimmedScenario = operatorMessage.trim();
      setLastScenario(trimmedScenario || null);

      try {
        // 1. Get or fetch the operator session (uses prewarm cache if available).
        const initPromise = ensureCanvasAvatarInitialized(bpAgentId);

        let session: TestSessionResult | null = prewarmRef.current.result;
        if (!session && prewarmRef.current.promise) {
          session = await prewarmRef.current.promise;
        }
        if (!session) {
          const res = await fetch(`${base}/api/canvas/operator-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedKey }),
            signal: controller.signal,
          });
          const body = (await res.json()) as {
            success?: boolean;
            message?: string;
            data?: TestSessionResult;
          };
          if (!res.ok || !body.success || !body.data) {
            throw new Error(body.message ?? "Failed to start operator session");
          }
          session = body.data;
        }
        // Burn the prewarm so the next send fetches a fresh visitor row.
        prewarmRef.current = { promise: null, result: null };

        await initPromise;
        if (controller.signal.aborted) return;

        const { visitorId, businessId } = session;
        const sessionId = `canvas-${Date.now()}`;
        setSessionActive(true);

        window.__piq_last = {
          visitorId,
          businessId,
          sessionId,
          ...(trimmedScenario ? { operatorMessage: trimmedScenario } : {}),
        };

        // 2. Fire presenceiq:ready so the SDK kicks off /api/pipeline (BP sync).
        window.dispatchEvent(
          new CustomEvent("presenceiq:ready", {
            detail: {
              visitorId,
              businessId,
              sessionId,
              operatorMessage: trimmedScenario || undefined,
              language,
            },
          })
        );

        // 3. In parallel, stream the opener text so the bubble fills now —
        //    and ALWAYS auto-speak it via OpenAI TTS as soon as the stream
        //    finalises. The BeyondPresence iframe stays as a "click to
        //    converse" surface; this guarantees the user hears the opener
        //    without needing to click "Start Conversation".
        (async () => {
          try {
            const final = await streamOpener(
              visitorId,
              businessId,
              trimmedScenario || undefined,
              language,
              controller
            );
            const text = final.opener?.trim();
            if (!text || controller.signal.aborted) return;
            ttsUsedRef.current = true;
            await speakViaTts(text, businessId, language);
          } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
              console.warn("[canvas] auto-speak failed", err);
            }
          }
        })();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Send failed";
        setError(msg);
        setSending(false);
        setSessionActive(false);
        throw err;
      } finally {
        sendingRef.current = false;
      }
    },
    [embedKey, streamOpener]
  );

  return {
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
  };
}
