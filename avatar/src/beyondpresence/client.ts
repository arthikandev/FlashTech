import { voiceIdForLanguage } from "./voices";
import type { PipelineData } from "../pipeline";
import type { SessionEndPayload } from "../webhook";
import { postSessionWebhook } from "../webhook";

export interface AgentContextUpdate {
  systemPrompt: string;
  firstMessage: string;
  voiceId?: string;
}

export interface BeyondPresenceClientOptions {
  apiKey?: string;
  agentId?: string;
  backendUrl: string;
  bpWebhookSecret: string;
  containerId?: string;
  mockMode?: boolean;
}

export type BPSessionEndData = {
  messages?: Array<{ role: string; content?: string; text?: string }>;
  duration?: number;
  outcome?: SessionEndPayload["outcome"];
};

export interface BeyondPresenceClient {
  init(): Promise<void>;
  updateAgentContext(update: AgentContextUpdate): Promise<void>;
  showAvatar(): void;
  hideAvatar(): void;
  onSessionEnd(handler: (session?: BPSessionEndData) => SessionEndPayload): void;
  getLastSession(): BPSessionEndData | undefined;
}

/** Global injected by BeyondPresence embed script (when not in mock mode). */
type BPGlobal = {
  init?: (opts: { apiKey: string; agentId: string }) => Promise<void>;
  updateAgentContext?: (ctx: AgentContextUpdate) => Promise<void>;
  show?: () => void;
  hide?: () => void;
  onSessionEnd?: (cb: (session?: BPSessionEndData) => void) => void;
  getMessages?: () => Array<{ role: string; content?: string; text?: string }>;
};

function getBpGlobal(): BPGlobal | undefined {
  return (window as Window & { beyondPresence?: BPGlobal }).beyondPresence;
}

class MockBeyondPresenceClient implements BeyondPresenceClient {
  private sessionHandler?: (session?: BPSessionEndData) => SessionEndPayload;
  private lastSession?: BPSessionEndData;
  private sessionEndListenerAttached = false;
  private containerId: string;

  constructor(
    private opts: BeyondPresenceClientOptions,
    containerId: string
  ) {
    this.containerId = containerId;
  }

  async init(): Promise<void> {
    const el = document.getElementById(this.containerId);
    if (el) {
      el.innerHTML =
        '<div style="padding:12px;border:2px dashed #0ea5e9;border-radius:8px;font-family:sans-serif">' +
        "<strong>PresenceIQ Avatar (mock)</strong><br/>Set BEYONDPRESENCE_API_KEY in demo/config.js for live agent." +
        "</div>";
    }
  }

  async updateAgentContext(update: AgentContextUpdate): Promise<void> {
    console.log("[PresenceIQ] mock updateAgentContext", update);
    const el = document.getElementById(this.containerId);
    if (el) {
      const preview = el.querySelector(".piq-opener") ?? document.createElement("p");
      preview.className = "piq-opener";
      preview.textContent = `Opener: ${update.firstMessage}`;
      if (!preview.parentElement) el.appendChild(preview);
    }
  }

  showAvatar(): void {
    const el = document.getElementById(this.containerId);
    if (el) el.style.visibility = "visible";
    console.log("[PresenceIQ] mock showAvatar");
  }

  hideAvatar(): void {
    const el = document.getElementById(this.containerId);
    if (el) el.style.visibility = "hidden";
  }

  onSessionEnd(handler: (session?: BPSessionEndData) => SessionEndPayload): void {
    this.sessionHandler = handler;
    if (this.sessionEndListenerAttached) return;
    this.sessionEndListenerAttached = true;
    window.addEventListener("presenceiq:mock-session-end", () => {
      void this.flushSession();
    });
  }

  getLastSession(): BPSessionEndData | undefined {
    return this.lastSession;
  }

  private async flushSession(): Promise<void> {
    if (!this.sessionHandler || !this.opts.bpWebhookSecret) return;
    try {
      const payload = this.sessionHandler(this.lastSession);
      await postSessionWebhook(
        this.opts.backendUrl,
        this.opts.bpWebhookSecret,
        payload
      );
      console.log("[PresenceIQ] mock session posted to backend");
    } catch (err) {
      console.error("[PresenceIQ] post-call webhook failed", err);
    }
  }
}

class SdkBeyondPresenceClient implements BeyondPresenceClient {
  private sessionHandler?: (session?: BPSessionEndData) => SessionEndPayload;
  private lastSession?: BPSessionEndData;
  private sessionEndListenerAttached = false;
  private containerId: string;

  constructor(
    private opts: BeyondPresenceClientOptions,
    containerId: string
  ) {
    this.containerId = containerId;
  }

  async init(): Promise<void> {
    const bp = getBpGlobal();
    if (!bp?.init) {
      throw new Error(
        "BeyondPresence SDK not loaded. Add BP script tag before presenceiq-avatar.js"
      );
    }
    await bp.init({
      apiKey: this.opts.apiKey!,
      agentId: this.opts.agentId!,
    });
  }

  async updateAgentContext(update: AgentContextUpdate): Promise<void> {
    const bp = getBpGlobal();
    if (!bp?.updateAgentContext) {
      throw new Error("beyondPresence.updateAgentContext not available");
    }
    await bp.updateAgentContext(update);
  }

  showAvatar(): void {
    getBpGlobal()?.show?.();
    const el = document.getElementById(this.containerId);
    if (el) el.style.visibility = "visible";
  }

  hideAvatar(): void {
    getBpGlobal()?.hide?.();
    const el = document.getElementById(this.containerId);
    if (el) el.style.visibility = "hidden";
  }

  onSessionEnd(handler: (session?: BPSessionEndData) => SessionEndPayload): void {
    this.sessionHandler = handler;
    if (this.sessionEndListenerAttached) return;
    const bp = getBpGlobal();
    if (bp?.onSessionEnd) {
      this.sessionEndListenerAttached = true;
      bp.onSessionEnd((session) => {
        this.lastSession = session ?? {
          messages: bp.getMessages?.() ?? [],
        };
        void this.flushSession();
      });
    }
  }

  getLastSession(): BPSessionEndData | undefined {
    return this.lastSession;
  }

  private async flushSession(): Promise<void> {
    if (!this.sessionHandler) return;
    const payload = this.sessionHandler(this.lastSession);
    await postSessionWebhook(
      this.opts.backendUrl,
      this.opts.bpWebhookSecret,
      payload
    );
  }
}

export function applyPipelineToAgent(
  client: BeyondPresenceClient,
  data: PipelineData
): Promise<void> {
  const voiceId = voiceIdForLanguage(data.visitor.language, data.business.industry);
  const tone = data.business.personaTone ?? "professional";
  const systemPrompt = [
    `You are a ${tone} assistant for ${data.business.name}.`,
    `Visitor: ${data.visitor.name ?? "guest"} (${data.visitor.language}).`,
    `Intent: ${data.intelligence.intentScore}/100. Action: ${data.intelligence.recommendedAction}.`,
    `Open with exactly: "${data.intelligence.personalisedOpener}"`,
  ].join("\n");

  return client.updateAgentContext({
    systemPrompt,
    firstMessage: data.intelligence.personalisedOpener,
    voiceId,
  });
}

export function createBeyondPresenceClient(
  opts: BeyondPresenceClientOptions,
  containerId = "presenceiq-avatar"
): BeyondPresenceClient {
  if (opts.mockMode || !opts.apiKey || !opts.agentId) {
    return new MockBeyondPresenceClient(opts, containerId);
  }
  return new SdkBeyondPresenceClient(opts, containerId);
}

export function defaultSessionPayload(
  visitorId: string,
  businessId: string,
  transcript: SessionEndPayload["transcript"]
): SessionEndPayload {
  return {
    visitorId,
    businessId,
    transcript,
    outcome: "informational",
    sentimentArc: [{ turn: 1, score: 0.75 }],
    actionItems: ["Follow up from demo session"],
    duration: 60,
  };
}
