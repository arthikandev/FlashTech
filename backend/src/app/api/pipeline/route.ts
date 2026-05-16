import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { runPipelineAutomation } from "@/lib/automation";
import { syncAgentFromIntelligence } from "@/lib/beyondPresenceApi";
import { pickKnowledgeContext } from "@/lib/knowledge";
import { api, getConvexClient } from "@/lib/convex";
import { checkRateLimit } from "@/lib/rateLimit";
import { runIntentPipeline, waitForCrmData } from "@/lib/pipeline";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
  waitForCrmMs: z.number().optional().default(500),
});

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const started = Date.now();
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`pipeline:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const visitorId = body.visitorId as Id<"visitors">;
    const businessId = body.businessId as Id<"businesses">;

    await waitForCrmData(visitorId, body.waitForCrmMs);

    const intelligence = await runIntentPipeline(visitorId, businessId);
    const convex = getConvexClient();
    const visitor = await convex.query(api.visitors.getById, { visitorId });
    const business = await convex.query(api.businesses.getById, { businessId });

    if (!visitor || !business) {
      return jsonError("Visitor or business not found", 404);
    }

    const automation = await runPipelineAutomation({
      visitor,
      business,
      intelligence,
    });

    const personaTone = business.avatarConfig.personaTone ?? "formal";
    const bpAgentId = business.avatarConfig.bpAgentId;

    const knowledgeContext = pickKnowledgeContext({
      chunks: business.knowledgeChunks ?? [],
      pageHistory: visitor.pageHistory,
    });

    const beyondPresence = await syncAgentFromIntelligence({
      bpAgentId,
      businessName: business.name,
      personaTone,
      visitorName: visitor.crmData?.name,
      language: visitor.language,
      intentScore: intelligence.intentScore,
      recommendedAction: intelligence.recommendedAction,
      personalisedOpener: intelligence.personalisedOpener,
      knowledgeContext,
    });

    return jsonSuccess({
      intelligence,
      visitor: {
        name: visitor.crmData?.name,
        language: visitor.language,
        crmId: visitor.crmId,
        returnCount: visitor.returnCount,
        fingerprint: visitor.fingerprint,
      },
      business: {
        name: business.name,
        industry: business.industry,
        personaTone,
      },
      bpAgentId: bpAgentId ?? null,
      beyondPresence,
      pipelineMs: Date.now() - started,
      automation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return jsonError(message, 500);
  }
}
