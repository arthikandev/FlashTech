/**
 * Beyond Presence API client (managed video agents).
 * API key stays server-side — see docs/BEYOND_PRESENCE.md
 */

const DEFAULT_BASE_URL = "https://api.bey.dev";
const REQUEST_TIMEOUT_MS = 5000;

export type BpAgentSummary = {
  id: string;
  name?: string;
};

function getConfig() {
  const baseUrl =
    process.env.BEYONDPRESENCE_API_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_BASE_URL;
  const apiKey = process.env.BEYONDPRESENCE_API_KEY?.trim();
  return { baseUrl, apiKey };
}

export function isBeyondPresenceConfigured(): boolean {
  return Boolean(getConfig().apiKey);
}

export async function bpFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const { baseUrl, apiKey } = getConfig();
  if (!apiKey) {
    return { ok: false, status: 0, data: null };
  }

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        ...(options.headers as Record<string, string>),
      },
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("[beyondpresence] fetch failed", path, err);
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timeout);
  }
}

/** GET /v1/auth/verify — 204 means valid key */
export async function verifyBeyondPresenceKey(): Promise<boolean> {
  const { status } = await bpFetch("/v1/auth/verify", { method: "GET" });
  return status === 204;
}

export async function listAgents(): Promise<BpAgentSummary[]> {
  const { ok, data } = await bpFetch("/v1/agents", { method: "GET" });
  if (!ok || !data || typeof data !== "object") return [];

  const root = data as Record<string, unknown>;
  const items = (Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.items)
      ? root.items
      : Array.isArray(data)
        ? data
        : []) as unknown[];

  const agents: BpAgentSummary[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    if (!id) continue;
    agents.push({
      id,
      name: typeof o.name === "string" ? o.name : undefined,
    });
  }
  return agents;
}

export function buildAgentSystemPrompt(args: {
  businessName: string;
  personaTone: string;
  visitorName?: string | null;
  language?: string | null;
  intentScore: number;
  recommendedAction: string;
  personalisedOpener: string;
  knowledgeContext?: string;
}): string {
  const visitorLabel = args.visitorName ?? "guest";
  const language = args.language ?? "en";

  const lines = [
    `You are a ${args.personaTone} assistant for ${args.businessName}.`,
    `Visitor: ${visitorLabel} (${language}).`,
    `Intent: ${args.intentScore}/100. Action: ${args.recommendedAction}.`,
    `Open with exactly: "${args.personalisedOpener}"`,
  ];

  if (args.knowledgeContext?.trim()) {
    lines.push("", "Product knowledge (use when relevant):", args.knowledgeContext.trim());
  }

  return lines.join("\n");
}

export async function updateAgentContext(
  agentId: string,
  args: { systemPrompt: string; greeting: string }
): Promise<{ ok: boolean; status: number }> {
  const { ok, status } = await bpFetch(`/v1/agents/${encodeURIComponent(agentId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      system_prompt: args.systemPrompt,
      greeting: args.greeting,
    }),
  });
  return { ok, status };
}

export type SyncAgentContextResult =
  | { synced: true }
  | { synced: false; reason: string };

export async function syncAgentFromIntelligence(args: {
  bpAgentId?: string | null;
  businessName: string;
  personaTone: string;
  visitorName?: string | null;
  language?: string | null;
  intentScore: number;
  recommendedAction: string;
  personalisedOpener: string;
  knowledgeContext?: string;
}): Promise<SyncAgentContextResult> {
  if (!isBeyondPresenceConfigured()) {
    return { synced: false, reason: "BEYONDPRESENCE_API_KEY not configured" };
  }

  const agentId = args.bpAgentId?.trim();
  if (!agentId) {
    return { synced: false, reason: "bpAgentId not set on business" };
  }

  const systemPrompt = buildAgentSystemPrompt(args);
  const { ok, status } = await updateAgentContext(agentId, {
    systemPrompt,
    greeting: args.personalisedOpener,
  });

  if (ok || status === 204) {
    return { synced: true };
  }

  return {
    synced: false,
    reason: `Beyond Presence agent update failed (HTTP ${status})`,
  };
}
