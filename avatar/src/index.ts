import { getConfig } from "./config";
import {
  buildSystemPrompt,
  fetchPipeline,
  type PipelineData,
} from "./pipeline";
import {
  applyPipelineToAgent,
  createBeyondPresenceClient,
  defaultSessionPayload,
} from "./beyondpresence/client";

const CONTAINER_ID = "presenceiq-avatar";
let lastPipeline: PipelineData | null = null;
let lastVisitorId: string | null = null;
let lastBusinessId: string | null = null;
let client: ReturnType<typeof createBeyondPresenceClient> | null = null;

function setAvatarLoading(loading: boolean): void {
  const el = document.getElementById(CONTAINER_ID);
  if (!el) return;
  el.style.visibility = "hidden";
  el.setAttribute("data-piq-loading", loading ? "true" : "false");
  if (loading) {
    el.setAttribute("aria-busy", "true");
  } else {
    el.removeAttribute("aria-busy");
  }
}

async function onPresenceIQReady(event: Event): Promise<void> {
  const detail = (event as CustomEvent).detail as {
    visitorId?: string;
    businessId?: string;
    sessionId?: string;
  };

  const visitorId = detail.visitorId;
  const businessId = detail.businessId;
  if (!visitorId || !businessId) {
    console.error("[PresenceIQ] presenceiq:ready missing visitorId or businessId");
    return;
  }

  lastVisitorId = visitorId;
  lastBusinessId = businessId;

  const config = getConfig();
  if (!client) {
    client = createBeyondPresenceClient(
      {
        apiKey: config.beyondPresenceApiKey,
        agentId: config.bpAgentId,
        backendUrl: config.backendUrl,
        bpWebhookSecret: config.bpWebhookSecret,
        mockMode: config.mockMode,
      },
      CONTAINER_ID
    );
    await client.init();
    client.hideAvatar();

    client.onSessionEnd(() => {
      const transcript = [
        {
          role: "user" as const,
          text: "Demo session ended",
          timestamp: Date.now(),
        },
        {
          role: "assistant" as const,
          text: lastPipeline?.intelligence.personalisedOpener ?? "Goodbye",
          timestamp: Date.now(),
        },
      ];
      return defaultSessionPayload(visitorId, businessId, transcript);
    });
  }

  setAvatarLoading(true);

  try {
    const data = await fetchPipeline(config.backendUrl, visitorId, businessId);
    lastPipeline = data;
    console.log("[PresenceIQ] pipeline", {
      pipelineMs: data.pipelineMs,
      opener: data.intelligence.personalisedOpener,
      systemPrompt: buildSystemPrompt(data),
    });

    await applyPipelineToAgent(client, data);
    client.showAvatar();
  } catch (err) {
    console.error("[PresenceIQ] pipeline error", err);
    await client.updateAgentContext({
      systemPrompt: "You are a helpful banking assistant for Seylan Bank.",
      firstMessage: "Hello! How can I help you today?",
    });
    client.showAvatar();
  } finally {
    setAvatarLoading(false);
  }
}

function bootstrap(): void {
  window.addEventListener("presenceiq:ready", (e) => {
    void onPresenceIQReady(e);
  });
  console.log("[PresenceIQ] Avatar integration loaded", getConfig());
}

bootstrap();

export { bootstrap, onPresenceIQReady };
