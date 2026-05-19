import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";
import {
  resolveAutomationCrmFetchUrl,
  triggerCrmFetchAutomation,
} from "@/lib/pipeline";

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

    if ((result.returnCount > 1 || result.crmId) && automationCrmFetchReachable) {
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
    }

    return jsonSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fingerprint failed";
    return jsonError(message, 400);
  }
}
