/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  /** Same host as Convex `CLERK_JWT_ISSUER_DOMAIN` — optional, for auth troubleshooting copy in the UI */
  readonly VITE_CLERK_JWT_ISSUER_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __PRESENCEIQ_CONFIG__?: { bpAgentId?: string; backendUrl?: string };
  __piq_last?: {
    visitorId?: string;
    businessId?: string;
    sessionId?: string;
    operatorMessage?: string;
  };
  PresenceIQAvatar?: {
    init: (opts: {
      backendUrl?: string;
      container?: string | HTMLElement;
      avatarContainer?: string | HTMLElement;
      waitForCrmMs?: number;
      webhookSecret?: string;
    }) => void;
    initPresenceIQAvatar?: (opts: {
      backendUrl?: string;
      container?: string | HTMLElement;
      avatarContainer?: string | HTMLElement;
      waitForCrmMs?: number;
      webhookSecret?: string;
    }) => void;
  };
}
