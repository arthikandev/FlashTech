import type { BeyondPresenceClient, AgentContextUpdate } from "./client";

const BP_INIT_TIMEOUT_MS = 5000;
const BP_MAX_ATTEMPTS = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function rejectAfter(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

export type DefaultAvatarContext = AgentContextUpdate;

export async function warmAvatarWithRetry(
  client: BeyondPresenceClient,
  defaultContext: DefaultAvatarContext
): Promise<void> {
  for (let attempt = 1; attempt <= BP_MAX_ATTEMPTS; attempt++) {
    try {
      await Promise.race([
        client.updateAgentContext(defaultContext),
        rejectAfter(BP_INIT_TIMEOUT_MS, "BP_TIMEOUT"),
      ]);
      client.showAvatar();
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[PresenceIQ] BP warm attempt ${attempt} failed:`, message);
      if (attempt === BP_MAX_ATTEMPTS) {
        window.dispatchEvent(
          new CustomEvent("presenceiq:avatar-fallback", {
            detail: { reason: message },
          })
        );
        throw err;
      }
      await sleep(500);
    }
  }
}
