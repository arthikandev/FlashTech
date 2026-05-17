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

type PresenceIQSessionBody = z.infer<typeof bodySchema>;

/** Accept native Beyond Presence platform webhooks and map to PresenceIQ shape. */
function adaptWebhookBody(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const o = raw as Record<string, unknown>;

  if (o.visitorId && o.businessId && o.transcript) {
    return raw;
  }

  const event = String(o.event ?? o.type ?? "");
  if (event !== "call_ended" && event !== "session.ended") {
    return raw;
  }

  const meta = (o.metadata ?? o.meta ?? {}) as Record<string, unknown>;
  const visitorId = String(meta.visitorId ?? o.visitor_id ?? "");
  const businessId = String(meta.businessId ?? o.business_id ?? "");
  if (!visitorId || !businessId) return raw;

  const messages = (o.messages ?? o.transcript ?? []) as Array<{
    role?: string;
    content?: string;
    text?: string;
  }>;

  const transcript = messages
    .map((m, i) => {
      const text = (m.text ?? m.content ?? "").trim();
      if (!text) return null;
      const role = m.role === "user" || m.role === "human" ? "user" : "assistant";
      return {
        role: role as "user" | "assistant",
        text,
        timestamp: Date.now() - (messages.length - i) * 1000,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t != null);

  const duration =
    typeof o.duration_seconds === "number"
      ? o.duration_seconds
      : typeof o.duration === "number"
        ? o.duration
        : 60;

  return {
    visitorId,
    businessId,
    transcript:
      transcript.length > 0
        ? transcript
        : [
            {
              role: "assistant" as const,
              text: "Session ended (BP platform webhook)",
              timestamp: Date.now(),
            },
          ],
    outcome: "informational" as const,
    sentimentArc: [{ turn: 1, score: 0.7 }],
    actionItems: ["Review Beyond Presence session"],
    duration,
  };
}

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
    const raw = await request.json();
    const body = bodySchema.parse(adaptWebhookBody(raw)) as PresenceIQSessionBody;
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
      webhookUrls: business?.webhookUrls,
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
