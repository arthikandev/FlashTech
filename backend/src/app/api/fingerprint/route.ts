import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { applyDemoCrmIfNeeded } from "@/lib/demoCrm";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";
import { isSeylanApiConfigured } from "@/lib/env";
import {
  resolveAutomationCrmFetchUrl,
  triggerCrmFetchAutomation,
} from "@/lib/pipeline";
import { applySeylanCrmIfNeeded } from "@/lib/seylanCrm";

const bodySchema = z.object({
  embedKey: z.string(),
  fingerprint: z.string(),
  path: z.string(),
  title: z.string().optional(),
  language: z.string().default("en"),
  referrer: z.string().optional(),
});

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const convex = getConvexClient();

    const result = await convex.mutation(api.visitors.upsertFingerprint, body);

    const business = await convex.query(api.businesses.getById, {
      businessId: result.businessId as Id<"businesses">,
    });
    const automationCrmFetchReachable = Boolean(
      resolveAutomationCrmFetchUrl(business?.webhookUrls)
    );

    if (result.returnCount > 1 || result.crmId) {
      if (automationCrmFetchReachable) {
        void triggerCrmFetchAutomation(
          {
            visitorId: result.visitorId,
            businessId: result.businessId,
            fingerprint: body.fingerprint,
            crmId: result.crmId,
            returnCount: result.returnCount,
          },
          business?.webhookUrls
        );
      } else if (isSeylanApiConfigured()) {
        await applySeylanCrmIfNeeded({
          visitorId: result.visitorId as Id<"visitors">,
          crmId: result.crmId,
          fingerprint: body.fingerprint,
          returnCount: result.returnCount,
        });
      } else {
        await applyDemoCrmIfNeeded({
          visitorId: result.visitorId as Id<"visitors">,
          crmId: result.crmId,
          fingerprint: body.fingerprint,
          returnCount: result.returnCount,
        });
      }
    }

    return jsonSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fingerprint failed";
    return jsonError(message, 400);
  }
}
