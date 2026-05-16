export type SessionOutcome =
  | "converted"
  | "escalated"
  | "abandoned"
  | "informational";

export interface TranscriptTurn {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface SessionEndPayload {
  visitorId: string;
  businessId: string;
  transcript: TranscriptTurn[];
  outcome: SessionOutcome;
  sentimentArc: { turn: number; score: number }[];
  actionItems: string[];
  duration: number;
}

export async function postSessionWebhook(
  backendUrl: string,
  bpWebhookSecret: string,
  payload: SessionEndPayload
): Promise<void> {
  const res = await fetch(
    `${backendUrl}/api/webhooks/beyondpresence/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BP-Webhook-Secret": bpWebhookSecret,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`BP session webhook failed (${res.status}): ${body}`);
  }
}
