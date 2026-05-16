import { embedAgent, hideAgentContainer, showAgentContainer } from "../beyondpresence/embedAgent";
import { selectVoiceId } from "../elevenlabs/selectVoice";
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
};

export function attachPresenceIQReadyListener(
  config: PresenceIQReadyConfig
): () => void {
  const handler = async (event: Event) => {
    const { visitorId, businessId } = (event as CustomEvent).detail ?? {};
    if (!visitorId || !businessId) return;

    hideAgentContainer(config.avatarContainer);
    config.onPipelineStart?.();
    window.dispatchEvent(new CustomEvent("presenceiq:pipeline-start"));

    const started = performance.now();

    try {
      const res = await fetch(
        `${config.backendUrl.replace(/\/$/, "")}/api/pipeline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            businessId,
            waitForCrmMs: config.waitForCrmMs ?? 500,
          }),
        }
      );

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message ?? "Pipeline failed");
      }

      const data = json.data as PipelineResponse;
      const elapsed = Math.round(performance.now() - started);
      console.info("[PresenceIQ] Pipeline complete", {
        pipelineMs: data.pipelineMs ?? elapsed,
        opener: data.intelligence.personalisedOpener,
      });

      const systemPrompt = buildSystemPrompt(
        data.intelligence,
        data.visitor,
        data.business
      );
      const voiceId = selectVoiceId(
        data.business.industry,
        data.visitor.language ?? "en"
      );
      console.info("[PresenceIQ] Agent context", { systemPrompt, voiceId });

      showAgentContainer(config.avatarContainer);
      embedAgent({
        container: config.avatarContainer,
        bpAgentId: data.bpAgentId,
      });

      config.onPipelineComplete?.(data);
      window.dispatchEvent(
        new CustomEvent("presenceiq:pipeline-complete", { detail: data })
      );
    } catch (err) {
      console.error("[PresenceIQ] Pipeline error", err);
      showAgentContainer(config.avatarContainer);
      config.onError?.(err);
    }
  };

  window.addEventListener("presenceiq:ready", handler);
  return () => window.removeEventListener("presenceiq:ready", handler);
}
