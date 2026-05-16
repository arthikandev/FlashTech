export type SessionEndPayload = {
  visitorId: string;
  businessId: string;
  transcript: Array<{ role: string; text: string; timestamp?: number }>;
  outcome?: string;
  sentimentArc?: Array<{ turn: number; score: number }>;
  actionItems?: string[];
  duration?: number;
};

export async function postSessionEnd(
  backendUrl: string,
  bpWebhookSecret: string,
  payload: SessionEndPayload
): Promise<{ ok: boolean; data?: unknown }> {
  const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/webhooks/beyondpresence/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BP-Webhook-Secret": bpWebhookSecret,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, data: json };
}
