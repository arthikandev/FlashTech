import { z } from "zod";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { NextRequest } from "next/server";
import { runPostCallAutomation } from "@/lib/automation";
import { verifyWebhookSecret } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import { analyzePostCallSession } from "@/lib/openai";
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

    const intelligence = await convex.query(api.intelligence.getLatestByVisitor, {
      visitorId,
    });
    const visitor = await convex.query(api.visitors.getById, { visitorId });
    const business = await convex.query(api.businesses.getById, { businessId });

    const intentScore = intelligence?.intentScore ?? 0;

    const analysis = await analyzePostCallSession({
      transcript: body.transcript,
      preIntentScore: intentScore,
      visitorName: visitor?.crmData?.name,
      businessName: business?.name ?? "Business",
    });

    const outcome = analysis?.outcome ?? body.outcome;
    const sentimentArc = analysis?.sentimentArc ?? body.sentimentArc;
    const actionItems =
      analysis && analysis.actionItems.length > 0
        ? analysis.actionItems
        : body.actionItems;
    const transcript =
      analysis?.summary && body.transcript.length > 0
        ? [
            ...body.transcript,
            {
              role: "assistant" as const,
              text: `[Summary] ${analysis.summary}`,
              timestamp: Date.now(),
            },
          ]
        : body.transcript;

    await convex.mutation(api.conversations.saveConversation, {
      visitorId,
      businessId,
      transcript,
      outcome,
      sentimentArc,
      actionItems,
      duration: body.duration,
    });

    const { fired, firedTriggerIds } = await convex.mutation(
      api.triggers.evaluateAndFire,
      {
        businessId,
        visitorId,
        intentScore,
        visitorName: visitor?.crmData?.name,
        recommendedAction: intelligence?.recommendedAction,
        sessionOutcome: outcome,
      }
    );

    const automation = await runPostCallAutomation({
      visitorId,
      businessId,
      visitor,
      intelligence,
      firedTriggers: fired,
      session: {
        transcript,
        outcome,
        sentimentArc,
        actionItems,
        duration: body.duration,
      },
    });

    return jsonSuccess({
      saved: true,
      intentScore,
      postCallAnalyzed: Boolean(analysis),
      firedTriggerIds,
      automation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session webhook failed";
    return jsonError(message, 400);
  }
}
