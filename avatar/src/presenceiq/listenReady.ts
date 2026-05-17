import { embedAgent, hideAgentContainer, showAgentContainer } from "../beyondpresence/embedAgent";
import { selectVoiceId } from "../elevenlabs/selectVoice";
import type { VoiceTone } from "../tone";
import { buildSystemPrompt } from "./buildSystemPrompt";

export type PresenceIQReadyConfig = {
  backendUrl: string;
  /** Avatar DOM mount point */
  avatarContainer: HTMLElement;
  waitForCrmMs?: number;
  onPipelineStart?: () => void;
  onPipelineComplete?: (data: PipelineResponse) => void;
  onError?: (err: unknown) => void;
};

export type PipelineResponse = {
  intelligence: {
    intentScore: number;
    personalisedOpener: string;
    recommendedAction: string;
    signals?: string[];
  };
  visitor: {
    name?: string;
    language?: string;
    crmId?: string;
    returnCount?: number;
  };
  business: {
    name: string;
    industry: string;
    personaTone?: string;
  };
  bpAgentId?: string | null;
  beyondPresence?: { synced: boolean; reason?: string };
  pipelineMs?: number;
  voice?: { voiceId?: string; tone?: string; label?: string };
};

const DEFAULT_OPENER = "Hello! How can I help you today?";

function mark(name: string): void {
  try {
    performance.mark(name);
  } catch {
    /* ignore */
  }
}

async function fetchPipeline(
  backendUrl: string,
  visitorId: string,
  businessId: string,
  waitForCrmMs: number
): Promise<PipelineResponse> {
  const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, businessId, waitForCrmMs }),
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? "Pipeline failed");
  }

  return json.data as PipelineResponse;
}

function mountIframe(
  container: HTMLElement,
  bpAgentId?: string | null
): void {
  showAgentContainer(container);
  embedAgent({ container, bpAgentId });
}

export function attachPresenceIQReadyListener(
  config: PresenceIQReadyConfig
): () => void {
  const handler = async (event: Event) => {
    const { visitorId, businessId } = (event as CustomEvent).detail ?? {};
    if (!visitorId || !businessId) return;

    hideAgentContainer(config.avatarContainer);
    config.onPipelineStart?.();
    mark("piq:ready");
    mark("piq:pipeline-start");
    window.dispatchEvent(new CustomEvent("presenceiq:pipeline-start"));

    const waitForCrmMs = config.waitForCrmMs ?? 200;
    const pipelinePromise = fetchPipeline(
      config.backendUrl,
      visitorId,
      businessId,
      waitForCrmMs
    );

    const iframePromise = Promise.resolve().then(() => {
      mountIframe(config.avatarContainer, null);
    });

    const [pipelineSettled] = await Promise.allSettled([
      pipelinePromise,
      iframePromise,
    ]);

    if (pipelineSettled.status === "fulfilled") {
      const data = pipelineSettled.value;
      mark("piq:pipeline-done");

      const systemPrompt = buildSystemPrompt(
        data.intelligence,
        data.visitor,
        data.business
      );
      const voiceId =
        data.voice?.voiceId ??
        selectVoiceId(
          data.business.industry,
          data.visitor.language ?? "en",
          data.voice?.tone as VoiceTone | undefined
        );
      console.info("[PresenceIQ] Pipeline complete", {
        pipelineMs: data.pipelineMs,
        opener: data.intelligence.personalisedOpener,
        systemPrompt,
        voiceId,
      });

      mountIframe(config.avatarContainer, data.bpAgentId);
      config.onPipelineComplete?.(data);
      window.dispatchEvent(
        new CustomEvent("presenceiq:pipeline-complete", { detail: data })
      );
    } else {
      console.error("[PresenceIQ] Pipeline error", pipelineSettled.reason);
      mountIframe(config.avatarContainer, null);
      config.onError?.(pipelineSettled.reason);
      window.dispatchEvent(
        new CustomEvent("presenceiq:avatar-fallback", {
          detail: {
            reason: String(pipelineSettled.reason),
            fallbackOpener: DEFAULT_OPENER,
          },
        })
      );
    }

    mark("piq:avatar-visible");
  };

  window.addEventListener("presenceiq:ready", handler);
  return () => window.removeEventListener("presenceiq:ready", handler);
}
