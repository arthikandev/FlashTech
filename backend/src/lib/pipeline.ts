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

const WEBHOOK_TIMEOUT_MS = 2_000;

async function postWebhook(
  url: string,
  payload: Record<string, unknown> | unknown,
  label: string
): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
  } catch (err) {
    const aborted =
      (err instanceof Error && err.name === "AbortError") ||
      (err instanceof DOMException && err.name === "TimeoutError");
    console.error(
      JSON.stringify({
        event: aborted ? "webhook_timeout" : "webhook_failed",
        label,
        url,
        timeoutMs: WEBHOOK_TIMEOUT_MS,
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
}

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
  await postWebhook(url, payload, "crm_fetch");
}

export async function fireSlackWebhook(
  payload: Record<string, unknown>,
  tenantUrls?: BusinessWebhookUrls | null
): Promise<void> {
  const url = resolveAutomationSlackHotLeadUrl(tenantUrls);
  if (!url) return;
  await postWebhook(url, payload, "slack_hot_lead");
}

export async function forwardCrmPush(
  payload: Record<string, unknown>,
  tenantUrls?: BusinessWebhookUrls | null
): Promise<void> {
  const url = resolveAutomationCrmPushUrl(tenantUrls);
  if (!url) return;
  await postWebhook(url, payload, "crm_push");
}

export async function fireChurnWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  const url = resolveAutomationChurnUrl();
  if (!url) return;
  await postWebhook(url, payload, "churn_workflow");
}

export async function fireTriggerWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!webhookUrl?.trim()) return;
  await postWebhook(webhookUrl, payload, "trigger");
}
