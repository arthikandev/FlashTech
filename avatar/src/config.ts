export interface PresenceIQConfig {
  backendUrl: string;
  bpWebhookSecret: string;
  beyondPresenceApiKey?: string;
  bpAgentId?: string;
  /** When true, skip real BP SDK and log pipeline results only */
  mockMode?: boolean;
}

declare global {
  interface Window {
    __PRESENCEIQ_CONFIG__?: Partial<PresenceIQConfig>;
    __piq_bp_webhook_secret?: string;
  }
}

export function getConfig(): PresenceIQConfig {
  const c = window.__PRESENCEIQ_CONFIG__ ?? {};
  return {
    backendUrl: c.backendUrl ?? "http://localhost:3001",
    bpWebhookSecret:
      c.bpWebhookSecret ??
      (typeof window !== "undefined" ? window.__piq_bp_webhook_secret : "") ??
      "",
    beyondPresenceApiKey: c.beyondPresenceApiKey,
    bpAgentId: c.bpAgentId,
    mockMode: c.mockMode ?? !c.beyondPresenceApiKey,
  };
}
