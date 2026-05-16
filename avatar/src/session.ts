import type { PipelineData, SessionPayload } from "./types";

export function buildStubSessionPayload(
  visitorId: string,
  businessId: string,
  pipeline: PipelineData,
  sessionStartMs: number
): SessionPayload {
  const opener = pipeline.intelligence.personalisedOpener;
  const duration = Math.max(1, Math.floor((Date.now() - sessionStartMs) / 1000));

  const hotLead = pipeline.intelligence.intentScore >= 80;

  return {
    visitorId,
    businessId,
    transcript: [
      {
        role: "assistant",
        text: opener,
        timestamp: 0,
      },
      {
        role: "user",
        text: hotLead
          ? "Yes, I want to open an account."
          : "Tell me more about your plans.",
        timestamp: 3000,
      },
    ],
    outcome: hotLead ? "converted" : "informational",
    sentimentArc: [{ turn: 1, score: pipeline.intelligence.intentScore / 100 }],
    actionItems: pipeline.intelligence.recommendedAction
      ? [pipeline.intelligence.recommendedAction]
      : [],
    duration,
  };
}

export async function postSessionEnd(
  backendUrl: string,
  webhookSecret: string,
  payload: SessionPayload
): Promise<void> {
  if (!webhookSecret) {
    console.warn(
      "[PresenceIQ] BP_WEBHOOK_SECRET not set — skipping post-call webhook"
    );
    return;
  }

  const res = await fetch(`${backendUrl}/api/webhooks/beyondpresence/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BP-Webhook-Secret": webhookSecret,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[PresenceIQ] Post-call webhook failed", res.status, text);
  }
}
