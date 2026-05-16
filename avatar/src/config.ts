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
  }
}

export function getConfig(): PresenceIQConfig {
  const c = window.__PRESENCEIQ_CONFIG__ ?? {};
  return {
    backendUrl: c.backendUrl ?? "http://localhost:3000",
    bpWebhookSecret: c.bpWebhookSecret ?? "",
    beyondPresenceApiKey: c.beyondPresenceApiKey,
    bpAgentId: c.bpAgentId,
    mockMode: c.mockMode ?? !c.beyondPresenceApiKey,
  };
}
