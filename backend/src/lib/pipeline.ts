import type { Doc, Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import { scoreIntent } from "./openai";
import type { IntelligenceResult } from "./types";
import type { BusinessWebhookUrls } from "./webhookUrlsResolve";
import {
  pickChurnRiskWebhookUrl,
  pickTenantCrmFetchUrl,
  pickTenantCrmPushUrl,
  pickTenantSlackHotLeadUrl,
} from "./webhookUrlsResolve";

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
  businessId: Id<"businesses">,
  options?: { operatorMessage?: string; model?: string }
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
    operatorMessage: options?.operatorMessage,
    model: options?.model,
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

export function resolveAutomationCrmFetchUrl(
  tenant?: BusinessWebhookUrls | null
): string | undefined {
  return pickTenantCrmFetchUrl(tenant ?? undefined);
}

export function resolveAutomationSlackHotLeadUrl(
  tenant?: BusinessWebhookUrls | null
): string | undefined {
  return pickTenantSlackHotLeadUrl(tenant ?? undefined);
}

export function resolveAutomationCrmPushUrl(
  tenant?: BusinessWebhookUrls | null
): string | undefined {
  return pickTenantCrmPushUrl(tenant ?? undefined);
}

export function resolveAutomationChurnUrl(): string | undefined {
  return pickChurnRiskWebhookUrl();
}

export async function triggerCrmFetchAutomation(
  payload: {
    visitorId: string;
    businessId: string;
    fingerprint: string;
    crmId?: string;
    returnCount: number;
  },
  tenantUrls?: BusinessWebhookUrls | null
): Promise<void> {
  const url = resolveAutomationCrmFetchUrl(tenantUrls);
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[automation] CRM fetch trigger failed", err);
  }
}

export async function fireSlackWebhook(
  payload: Record<string, unknown>,
  tenantUrls?: BusinessWebhookUrls | null
): Promise<void> {
  const url = resolveAutomationSlackHotLeadUrl(tenantUrls);
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[automation] Slack hot-lead webhook failed", err);
  }
}

export async function forwardCrmPush(
  payload: Record<string, unknown>,
  tenantUrls?: BusinessWebhookUrls | null
): Promise<void> {
  const url = resolveAutomationCrmPushUrl(tenantUrls);
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[automation] CRM push failed", err);
  }
}

export async function fireChurnWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  const url = resolveAutomationChurnUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[automation] Churn workflow webhook failed", err);
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
