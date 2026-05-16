import { z } from "zod";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { NextRequest } from "next/server";
import { verifyWebhookSecret } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import {
  fireSlackWebhook,
  forwardCrmPush,
} from "@/lib/pipeline";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
  transcript: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      text: z.string(),
      timestamp: z.number(),
    })
  ),
  outcome: z.enum(["converted", "escalated", "abandoned", "informational"]),
  sentimentArc: z.array(
    z.object({
      turn: z.number(),
      score: z.number(),
    })
  ),
  actionItems: z.array(z.string()),
  duration: z.number(),
});

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: NextRequest) {
  if (
    !verifyWebhookSecret(
      request,
      "x-bp-webhook-secret",
      process.env.BP_WEBHOOK_SECRET
    )
  ) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const visitorId = body.visitorId as Id<"visitors">;
    const businessId = body.businessId as Id<"businesses">;
    const convex = getConvexClient();

    await convex.mutation(api.conversations.saveConversation, {
      visitorId,
      businessId,
      transcript: body.transcript,
      outcome: body.outcome,
      sentimentArc: body.sentimentArc,
      actionItems: body.actionItems,
      duration: body.duration,
    });

    const intelligence = await convex.query(api.intelligence.getLatestByVisitor, {
      visitorId,
    });
    const visitor = await convex.query(api.visitors.getById, { visitorId });

    const intentScore = intelligence?.intentScore ?? 0;

    const { firedTriggerIds } = await convex.mutation(
      api.triggers.evaluateAndFire,
      {
        businessId,
        visitorId,
        intentScore,
        visitorName: visitor?.crmData?.name,
        recommendedAction: intelligence?.recommendedAction,
      }
    );

    if (intentScore > 80) {
      void fireSlackWebhook({
        type: "hot_lead",
        name: visitor?.crmData?.name ?? "Unknown",
        intentScore,
        recommendedAction: intelligence?.recommendedAction,
        actionItems: body.actionItems,
        outcome: body.outcome,
      });
    }

    void forwardCrmPush({
      visitorId: body.visitorId,
      businessId: body.businessId,
      intentScore,
      transcript: body.transcript,
      outcome: body.outcome,
      actionItems: body.actionItems,
    });

    return jsonSuccess({
      saved: true,
      intentScore,
      firedTriggerIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session webhook failed";
    return jsonError(message, 400);
  }
}
