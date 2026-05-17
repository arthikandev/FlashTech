import type { Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import { isCrmFetchWebhookConfigured } from "./automationEnv";

/** Demo CRM records — matches frontend/public/fake-crm.json and automation CRM shape */
const DEMO_CRM: Record<
  string,
  {
    name: string;
    email: string;
    accountType: string;
    churnRisk: string;
    notes: string;
  }
> = {
  "CRM-001": {
    name: "Sarangan",
    email: "sarangan@example.com",
    accountType: "prospect",
    churnRisk: "low",
    notes: "Compared Gold and Platinum plans 3 times this week",
  },
};

const DEMO_FINGERPRINT = "demo-sarangan-fp";

export function resolveDemoCrmId(crmId?: string, fingerprint?: string): string | null {
  if (crmId && DEMO_CRM[crmId]) return crmId;
  if (fingerprint === DEMO_FINGERPRINT) return "CRM-001";
  if (crmId) return null;
  return "CRM-001";
}

/**
 * When no external CRM-fetch webhook is configured, patch visitor CRM data directly for demo flows.
 */
export async function applyDemoCrmIfNeeded(args: {
  visitorId: Id<"visitors">;
  crmId?: string;
  fingerprint: string;
  returnCount: number;
}): Promise<boolean> {
  if (isCrmFetchWebhookConfigured()) return false;

  const shouldEnrich = args.returnCount > 1 || Boolean(args.crmId) || args.fingerprint === DEMO_FINGERPRINT;
  if (!shouldEnrich) return false;

  const resolvedCrmId = resolveDemoCrmId(args.crmId, args.fingerprint);
  if (!resolvedCrmId) return false;

  const crmData = DEMO_CRM[resolvedCrmId];
  if (!crmData) return false;

  const convex = getConvexClient();
  await convex.mutation(api.visitors.patchCrmData, {
    visitorId: args.visitorId,
    crmId: resolvedCrmId,
    crmData,
  });

  return true;
}
