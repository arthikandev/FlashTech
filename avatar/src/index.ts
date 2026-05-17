import { getConfig } from "./config";
import {
  buildSystemPrompt,
  fetchPipeline,
  type PipelineData,
} from "./pipeline";
import {
  createBeyondPresenceClient,
  defaultSessionPayload,
  type BPSessionEndData,
  type BeyondPresenceClient,
} from "./beyondpresence/client";
import type { SessionEndPayload } from "./webhook";
import { mapBpMessagesToTranscript } from "./sessionTranscript";
import { warmAvatarWithRetry } from "./beyondpresence/startWithRetry";
import { resolveAvatarContainer, type InitOptions } from "./types";

const CONTAINER_ID = "presenceiq-avatar";
let mountContainerId = CONTAINER_ID;
const DEFAULT_OPENER = "Hello! How can I help you today?";
const DEFAULT_SYSTEM =
  "You are a helpful assistant. Greet the visitor warmly and ask how you can help.";

let bootstrapAttached = false;
let lastPipeline: PipelineData | null = null;
let lastVisitorId: string | null = null;
let lastBusinessId: string | null = null;
/** Incremented on each presenceiq:ready so stale overlapping handlers do not clobber context. */
let readyGeneration = 0;
/**
 * Visitor/business/pipeline frozen when the avatar is shown for the active BP call.
 * One embed instance should run one visible call at a time; a new presenceiq:ready clears
 * this so a late session-end from a prior call does not reuse stale visible context.
 */
let activeCallContext: {
  visitorId: string;
  businessId: string;
  pipeline: PipelineData | null;
} | null = null;
let client: ReturnType<typeof createBeyondPresenceClient> | null = null;

function isLatestReady(gen: number): boolean {
  return gen === readyGeneration;
}

function setLatestReadyContext(
  gen: number,
  visitorId: string,
  businessId: string,
  pipeline: PipelineData | null = null
): void {
  if (!isLatestReady(gen)) return;
  lastVisitorId = visitorId;
  lastBusinessId = businessId;
  if (pipeline) lastPipeline = pipeline;
}

function setAvatarLoading(loading: boolean): void {
  const el = document.getElementById(mountContainerId);
  if (!el) return;
  el.setAttribute("data-piq-loading", loading ? "true" : "false");
  if (loading) {
    el.setAttribute("aria-busy", "true");
  } else {
    el.removeAttribute("aria-busy");
  }
}

function mark(name: string): void {
  try {
    performance.mark(name);
  } catch {
    /* ignore */
  }
}

function measure(name: string, start: string, end: string): void {
  try {
    performance.measure(name, start, end);
  } catch {
    /* ignore */
  }
}

/** Prefer context frozen at avatar show time; fall back to latest ready ids. */
function buildSessionEndPayload(session?: BPSessionEndData): SessionEndPayload {
  const visitorId = activeCallContext?.visitorId ?? lastVisitorId;
  const businessId = activeCallContext?.businessId ?? lastBusinessId;
  if (!visitorId || !businessId) {
    throw new Error("[PresenceIQ] session end without active visitor/business context");
  }
  const opener =
    activeCallContext?.pipeline?.intelligence.personalisedOpener ??
    lastPipeline?.intelligence.personalisedOpener ??
    DEFAULT_OPENER;
  const transcript = mapBpMessagesToTranscript(session, opener);
  const payload = defaultSessionPayload(visitorId, businessId, transcript);
  if (session?.duration != null && session.duration > 0) {
    payload.duration = session.duration;
  }
  if (session?.outcome) {
    payload.outcome = session.outcome;
  }
  return payload;
}

function attachSessionEndHandler(bpClient: BeyondPresenceClient): void {
  bpClient.onSessionEnd((session) => buildSessionEndPayload(session));
}

async function onPresenceIQReady(event: Event): Promise<void> {
  const detail = (event as CustomEvent).detail as {
    visitorId?: string;
    businessId?: string;
    sessionId?: string;
    operatorMessage?: string;
  };

  const visitorId = detail.visitorId;
  const businessId = detail.businessId;
  if (!visitorId || !businessId) {
    console.error("[PresenceIQ] presenceiq:ready missing visitorId or businessId");
    return;
  }

  const gen = ++readyGeneration;
  activeCallContext = null;
  setLatestReadyContext(gen, visitorId, businessId);

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
      mountContainerId
    );
    await client.init();
    client.hideAvatar();
    attachSessionEndHandler(client);
  }

  mark("piq:ready");
  setAvatarLoading(true);
  mark("piq:pipeline-start");
  window.dispatchEvent(new CustomEvent("presenceiq:pipeline-start"));

  const defaultContext = {
    systemPrompt: DEFAULT_SYSTEM,
    firstMessage: DEFAULT_OPENER,
  };

  const pipelinePromise = fetchPipeline(
    config.backendUrl,
    visitorId,
    businessId,
    config.waitForCrmMs ?? 200,
    detail.operatorMessage
  );

  const avatarWarmPromise = warmAvatarWithRetry(client, defaultContext);

  const [pipelineSettled, avatarSettled] = await Promise.allSettled([
    pipelinePromise,
    avatarWarmPromise,
  ]);

  let data: PipelineData | null = null;

  if (pipelineSettled.status === "fulfilled") {
    data = pipelineSettled.value;
    setLatestReadyContext(gen, visitorId, businessId, data);
    mark("piq:pipeline-done");
    console.log("[PresenceIQ] pipeline", {
      pipelineMs: data.pipelineMs,
      opener: data.intelligence.personalisedOpener,
      systemPrompt: buildSystemPrompt(data),
    });

    const serverSynced =
      data.syncStatus === "complete" || data.beyondPresence?.synced === true;
    if (!serverSynced) {
      console.warn(
        "[PresenceIQ] Server BP sync not complete — avatar displays with warmed default context"
      );
    } else {
      console.log("[PresenceIQ] Server authoritative BP agent sync complete");
    }

    window.dispatchEvent(
      new CustomEvent("presenceiq:pipeline-complete", { detail: data })
    );
  } else {
    const reason = String(pipelineSettled.reason);
    console.error("[PresenceIQ] pipeline error", pipelineSettled.reason);
    try {
      await client.updateAgentContext(defaultContext);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent("presenceiq:pipeline-error", {
        detail: { error: reason },
      })
    );
    window.dispatchEvent(
      new CustomEvent("presenceiq:avatar-fallback", {
        detail: { reason },
      })
    );
  }

  if (avatarSettled.status === "rejected") {
    console.error("[PresenceIQ] avatar warm failed", avatarSettled.reason);
    window.dispatchEvent(
      new CustomEvent("presenceiq:avatar-fallback", {
        detail: { reason: String(avatarSettled.reason) },
      })
    );
  } else if (isLatestReady(gen)) {
    mark("piq:avatar-visible");
    activeCallContext = {
      visitorId,
      businessId,
      pipeline: data,
    };
    client.showAvatar();
  }

  if (isLatestReady(gen)) {
    measure("time-to-pipeline", "piq:pipeline-start", "piq:pipeline-done");
    measure("time-to-avatar", "piq:ready", "piq:avatar-visible");
    setAvatarLoading(false);
  }
}

function bootstrap(): void {
  if (bootstrapAttached) return;
  bootstrapAttached = true;
  window.addEventListener("presenceiq:ready", (e) => {
    void onPresenceIQReady(e);
  });
  console.log("[PresenceIQ] Avatar integration loaded", getConfig());
}

/** Demo sites call this with `avatarContainer` (see frontend/sites/shared/boot.ts). */
function replayReadyIfMissed(): void {
  const last = window.__piq_last;
  if (last?.visitorId && last?.businessId) {
    void onPresenceIQReady(
      new CustomEvent("presenceiq:ready", {
        detail: {
          visitorId: last.visitorId,
          businessId: last.businessId,
          sessionId: last.sessionId,
          ...(last.operatorMessage?.trim()
            ? { operatorMessage: last.operatorMessage.trim() }
            : {}),
        },
      })
    );
  }
}

export function initPresenceIQAvatar(options: InitOptions): void {
  const el = resolveAvatarContainer(options);
  if (!el) {
    console.error(
      "[PresenceIQ] initPresenceIQAvatar requires container or avatarContainer"
    );
    return;
  }
  if (!el.id) el.id = CONTAINER_ID;
  mountContainerId = el.id;

  window.__PRESENCEIQ_CONFIG__ = {
    ...window.__PRESENCEIQ_CONFIG__,
    ...(options.backendUrl
      ? { backendUrl: options.backendUrl.replace(/\/$/, "") }
      : {}),
    ...(options.webhookSecret
      ? { bpWebhookSecret: options.webhookSecret }
      : {}),
    ...(options.waitForCrmMs !== undefined
      ? { waitForCrmMs: options.waitForCrmMs }
      : {}),
  };

  bootstrap();
  replayReadyIfMissed();
}

bootstrap();

if (typeof window !== "undefined") {
  window.PresenceIQAvatar = {
    init: initPresenceIQAvatar,
    initPresenceIQAvatar,
  };
}

export { bootstrap, onPresenceIQReady };
