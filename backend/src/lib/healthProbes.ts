import { getConvexClient, api } from "./convex";
import { isBeyondPresenceConfigured, verifyBeyondPresenceKey } from "./beyondPresenceApi";

const PROBE_TIMEOUT_MS = 2000;

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}

export type ProbeResult = {
  ok: boolean;
  latencyMs: number;
  detail?: string;
};

export async function probeConvex(): Promise<ProbeResult> {
  const start = Date.now();
  try {
    await Promise.race([
      getConvexClient().query(api.businesses.getByEmbedKey, {
        embedKey: "seylan-demo",
      }),
      rejectAfter(PROBE_TIMEOUT_MS),
    ]);
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function probeOpenAI(): Promise<ProbeResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, latencyMs: 0, detail: "OPENAI_API_KEY not set" };
  }

  const start = Date.now();
  try {
    const res = await Promise.race([
      fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      rejectAfter(PROBE_TIMEOUT_MS),
    ]);
    const ok = res.ok;
    return {
      ok,
      latencyMs: Date.now() - start,
      detail: ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function probeBeyondPresence(): Promise<ProbeResult> {
  if (!isBeyondPresenceConfigured()) {
    return { ok: false, latencyMs: 0, detail: "BEYONDPRESENCE_API_KEY not set" };
  }

  const start = Date.now();
  try {
    const ok = await Promise.race([
      verifyBeyondPresenceKey(),
      rejectAfter(PROBE_TIMEOUT_MS),
    ]);
    return {
      ok,
      latencyMs: Date.now() - start,
      detail: ok ? undefined : "verify failed",
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
