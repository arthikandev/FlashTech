import type { Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import { applyDemoCrmIfNeeded } from "./demoCrm";
import { isN8nCrmConfigured } from "./env";
import {
  fetchCrmForVisitor,
  getSeylanDemoAccountNumber,
  isSeylanApiConfigured,
} from "./seylanApi";

const DEMO_FINGERPRINT = "demo-sarangan-fp";
const DEMO_CRM_ID = "CRM-001";

function resolveAccountNumber(crmId?: string, fingerprint?: string): string {
  if (fingerprint === DEMO_FINGERPRINT || crmId === DEMO_CRM_ID) {
    return getSeylanDemoAccountNumber();
  }
  if (crmId?.startsWith("ACCT-")) {
    return crmId.replace(/^ACCT-/, "");
  }
  return getSeylanDemoAccountNumber();
}

/**
 * Enrich visitor from Seylan sandbox when configured.
 * Falls back to demoCrm.ts if sandbox returns nothing.
 */
export async function applySeylanCrmIfNeeded(args: {
  visitorId: Id<"visitors">;
  crmId?: string;
  fingerprint: string;
  returnCount: number;
}): Promise<boolean> {
  if (isN8nCrmConfigured() || !isSeylanApiConfigured()) return false;

  const shouldEnrich =
    args.returnCount > 1 ||
    Boolean(args.crmId) ||
    args.fingerprint === DEMO_FINGERPRINT;
  if (!shouldEnrich) return false;

  const accountNumber = resolveAccountNumber(args.crmId, args.fingerprint);
  const result = await fetchCrmForVisitor({
    accountNumber,
    crmId: args.crmId ?? DEMO_CRM_ID,
  });

  const convex = getConvexClient();

  if (result) {
    await convex.mutation(api.visitors.patchCrmData, {
      visitorId: args.visitorId,
      crmId: result.crmId,
      crmData: result.crmData,
    });
    return true;
  }

  return applyDemoCrmIfNeeded(args);
}
