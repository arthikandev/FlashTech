import type { Doc } from "../../convex/_generated/dataModel";
import {
  envChurnRiskWebhookUrl,
  envCrmFetchTriggerUrl,
  envCrmPushUrl,
  envSlackHotLeadUrl,
} from "./automationEnv";

export type BusinessWebhookUrls = Doc<"businesses">["webhookUrls"];

export function pickTenantCrmFetchUrl(
  urls?: BusinessWebhookUrls | null
): string | undefined {
  const t =
    urls?.crmFetch?.trim() || urls?.n8nCrmFetch?.trim();
  if (t) return t;
  return envCrmFetchTriggerUrl();
}

export function pickTenantSlackHotLeadUrl(
  urls?: BusinessWebhookUrls | null
): string | undefined {
  const t =
    urls?.slackHotLead?.trim() || urls?.n8nSlack?.trim();
  if (t) return t;
  return envSlackHotLeadUrl();
}

export function pickTenantCrmPushUrl(
  urls?: BusinessWebhookUrls | null
): string | undefined {
  const t = urls?.crmPush?.trim() || urls?.n8nCrmPush?.trim();
  if (t) return t;
  return envCrmPushUrl();
}

/** Server-wide churn workflow URL only (not per tenant). */
export function pickChurnRiskWebhookUrl(): string | undefined {
  return envChurnRiskWebhookUrl();
}
