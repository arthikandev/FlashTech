import { z } from "zod";
import { api, getConvexClient } from "@/lib/convex";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";
import { triggerN8nCrmFetch } from "@/lib/pipeline";

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

    if (result.returnCount > 1 || result.crmId) {
      void triggerN8nCrmFetch({
        visitorId: result.visitorId,
        businessId: result.businessId,
        fingerprint: body.fingerprint,
        crmId: result.crmId,
        returnCount: result.returnCount,
      });
    }

    return jsonSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fingerprint failed";
    return jsonError(message, 400);
  }
}
