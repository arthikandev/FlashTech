export type PresenceIQReadyDetail = {
  visitorId: string;
  businessId: string;
  sessionId?: string;
  operatorMessage?: string;
  returnCount?: number;
  isKnownVisitor?: boolean;
};

export type BeyondPresenceSync = {
  synced: boolean;
  reason?: string;
};

export type PipelineIntelligence = {
  intentScore: number;
  personalisedOpener: string;
  recommendedAction: string;
  signals: string[];
  computedAt: number;
};

export type PipelineData = {
  intelligence: PipelineIntelligence;
  visitor: {
    name?: string;
    language?: string;
    crmId?: string;
    returnCount?: number;
    fingerprint?: string;
  };
  business: {
    name: string;
    industry: string;
    personaTone?: string;
  };
  bpAgentId: string | null;
  beyondPresence: BeyondPresenceSync;
  pipelineMs?: number;
};

export type PipelineResponse = {
  success: boolean;
  data?: PipelineData;
  error?: string;
};

export type SessionOutcome =
  | "converted"
  | "escalated"
  | "abandoned"
  | "informational";

export type TranscriptEntry = {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

export type SessionPayload = {
  visitorId: string;
  businessId: string;
  transcript: TranscriptEntry[];
  outcome: SessionOutcome;
  sentimentArc: { turn: number; score: number }[];
  actionItems: string[];
  duration: number;
};

export type AvatarConfig = {
  backendUrl: string;
  webhookSecret: string;
};

export type InitOptions = {
  /** Mount target for the BP iframe (element or DOM id) */
  container?: string | HTMLElement;
  /** Alias used by demo sites (frontend frozen — do not require boot.ts changes) */
  avatarContainer?: string | HTMLElement;
  backendUrl?: string;
  webhookSecret?: string;
  waitForCrmMs?: number;
  autoInit?: boolean;
};

function resolveContainerRef(
  ref: string | HTMLElement | undefined
): HTMLElement | null {
  if (ref == null) return null;
  if (typeof ref === "string") {
    const id = ref.trim();
    return id ? document.getElementById(id) : null;
  }
  return ref;
}

/** Resolve container from InitOptions (supports legacy demo `avatarContainer`). */
export function resolveAvatarContainer(
  options: InitOptions
): HTMLElement | null {
  return (
    resolveContainerRef(options.container) ??
    resolveContainerRef(options.avatarContainer) ??
    null
  );
}

declare global {
  interface Window {
    __piq_bp_webhook_secret?: string;
    __piq_last?: {
      visitorId?: string;
      businessId?: string;
      sessionId?: string;
      operatorMessage?: string;
      returnCount?: number;
      isKnownVisitor?: boolean;
    };
    PresenceIQAvatar?: {
      init: typeof import("./index").initPresenceIQAvatar;
    };
  }
}
