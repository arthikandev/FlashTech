/**
 * Person 1 — copy this pattern into your BeyondPresence integration.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

window.addEventListener("presenceiq:ready", async (event: Event) => {
  const { visitorId, businessId } = (event as CustomEvent).detail;

  const res = await fetch(`${BACKEND_URL}/api/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, businessId, waitForCrmMs: 500 }),
  });

  const { data } = await res.json();
  const { intelligence, visitor, business } = data;

  const systemPrompt = [
    `You are a ${business.personaTone} assistant for ${business.name}.`,
    `Visitor: ${visitor.name ?? "guest"} (${visitor.language}).`,
    `Intent: ${intelligence.intentScore}/100. Action: ${intelligence.recommendedAction}.`,
    `Open with exactly: "${intelligence.personalisedOpener}"`,
  ].join("\n");

  // TODO: beyondPresence.updateAgentContext({ systemPrompt, firstMessage: intelligence.personalisedOpener });
  // TODO: beyondPresence.showAvatar();
  console.log("[PresenceIQ] Ready for avatar", { systemPrompt, intelligence });
});
