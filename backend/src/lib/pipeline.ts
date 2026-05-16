import type { Doc, Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import { scoreIntent } from "./openai";
import type { IntelligenceResult } from "./types";

export type PipelineContext = {
  intelligence: IntelligenceResult;
  visitor: Doc<"visitors">;
  business: Doc<"businesses">;
};

export function saveIntelligenceAsync(
  visitorId: Id<"visitors">,
  businessId: Id<"businesses">,
  intelligence: IntelligenceResult
): void {
  const convex = getConvexClient();
  void convex
    .mutation(api.intelligence.saveIntelligence, {
      visitorId,
      businessId,
      intentScore: intelligence.intentScore,
      personalisedOpener: intelligence.personalisedOpener,
      recommendedAction: intelligence.recommendedAction,
      signals: intelligence.signals,
    })
    .catch((err) => {
      console.error(
        JSON.stringify({
          event: "save_intelligence_failed",
          visitorId,
          businessId,
          error: err instanceof Error ? err.message : String(err),
        })
      );
    });
}

export async function runIntentPipeline(
  visitorId: Id<"visitors">,
  businessId: Id<"businesses">
): Promise<PipelineContext> {
  const convex = getConvexClient();

  const visitor = await convex.query(api.visitors.getById, { visitorId });
  const business = await convex.query(api.businesses.getById, { businessId });

  if (!visitor || !business) {
    throw new Error("Visitor or business not found");
  }

  const intelligence = await scoreIntent({
    visitorId,
    industry: business.industry,
    businessName: business.name,
    visitorName: visitor.crmData?.name,
    returnCount: visitor.returnCount,
    language: visitor.language,
    timeOnSiteMs: visitor.timeOnSite,
    pageHistory: visitor.pageHistory,
    crmNotes: visitor.crmData?.notes,
    churnRisk: visitor.crmData?.churnRisk,
    fingerprint: visitor.fingerprint,
  });

  saveIntelligenceAsync(visitorId, businessId, intelligence);

  return { intelligence, visitor, business };
}

export async function waitForCrmData(
  visitorId: Id<"visitors">,
  waitMs: number
): Promise<void> {
  const convex = getConvexClient();
  const deadline = Date.now() + waitMs;
  const pollMs = 50;

  while (Date.now() < deadline) {
    const visitor = await convex.query(api.visitors.getById, { visitorId });
    if (visitor?.crmData?.name) return;
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

export async function triggerN8nCrmFetch(payload: {
  visitorId: string;
  businessId: string;
  fingerprint: string;
  crmId?: string;
  returnCount: number;
}): Promise<void> {
  const url = process.env.N8N_WEBHOOK_CRM_FETCH;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[n8n] CRM fetch trigger failed", err);
  }
}

export async function fireSlackWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.N8N_WEBHOOK_SLACK;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[n8n] Slack webhook failed", err);
  }
}

export async function forwardCrmPush(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.N8N_WEBHOOK_CRM_PUSH;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[n8n] CRM push failed", err);
  }
}

export async function fireChurnWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  const url = process.env.N8N_WEBHOOK_CHURN;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[n8n] Churn webhook failed", err);
  }
}

export async function fireTriggerWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!webhookUrl?.trim()) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[automation] Trigger webhook failed", webhookUrl, err);
  }
}
