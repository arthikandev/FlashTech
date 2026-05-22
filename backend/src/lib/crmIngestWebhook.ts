import { z } from "zod";
import type { Id } from "../../convex/_generated/dataModel";
import { NextRequest } from "next/server";
import { verifyWebhookSecret } from "@/lib/auth";
import { envInboundCrmWebhookSecret } from "@/lib/automationEnv";
import { api, getConvexClient } from "@/lib/convex";
import { jsonError, jsonSuccess } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  crmId: z.string(),
  crmData: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    accountType: z.string().optional(),
    churnRisk: z.string().optional(),
    lastPurchase: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export async function handleInboundCrmIngest(request: NextRequest) {
  if (
    !verifyWebhookSecret(
      request,
      "x-webhook-secret",
      envInboundCrmWebhookSecret()
    )
  ) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const convex = getConvexClient();
    await convex.mutation(api.visitors.patchCrmData, {
      visitorId: body.visitorId as Id<"visitors">,
      crmId: body.crmId,
      crmData: body.crmData,
    });
    return jsonSuccess({ patched: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Inbound CRM webhook failed";
    return jsonError(message, 400);
  }
}
