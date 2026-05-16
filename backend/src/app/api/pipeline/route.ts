import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { runPipelineAutomation } from "@/lib/automation";
import { syncAgentFromIntelligence, type SyncAgentContextResult } from "@/lib/beyondPresenceApi";
import { pickKnowledgeContext } from "@/lib/knowledge";
import { checkRateLimit } from "@/lib/rateLimit";
import { runIntentPipeline, waitForCrmData } from "@/lib/pipeline";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
  waitForCrmMs: z.number().optional().default(200),
});

const PIPELINE_CEILING_MS = 1500;

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

    const t0 = Date.now();
    await waitForCrmData(visitorId, body.waitForCrmMs);
    const crmWaitMs = Date.now() - t0;

    const t1 = Date.now();
    const { intelligence, visitor, business } = await runIntentPipeline(
      visitorId,
      businessId
    );
    const intentMs = Date.now() - t1;

    const cacheHit = intelligence.signals.includes("cached");
    const fallbackUsed = intelligence.signals.includes("heuristic_fallback");

    const automationStart = Date.now();
    const automation = await runPipelineAutomation({
      visitor,
      business,
      intelligence,
    });
    const automationMs = Date.now() - automationStart;

    const personaTone = business.avatarConfig.personaTone ?? "formal";
    const bpAgentId = business.avatarConfig.bpAgentId;

    const knowledgeContext = pickKnowledgeContext({
      chunks: business.knowledgeChunks ?? [],
      pageHistory: visitor.pageHistory,
    });

    let beyondPresence: SyncAgentContextResult = {
      synced: false,
      reason: "bpAgentId not set on business",
    };
    let bpPatchMs = 0;

    if (bpAgentId?.trim()) {
      const bpStart = Date.now();
      const bpPromise = syncAgentFromIntelligence({
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

      const elapsed = Date.now() - started;
      const remaining = PIPELINE_CEILING_MS - elapsed;

      if (remaining > 0) {
        beyondPresence = await Promise.race([
          bpPromise,
          new Promise<SyncAgentContextResult>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  synced: false,
                  reason: "Beyond Presence sync deferred (pipeline ceiling)",
                }),
              remaining
            )
          ),
        ]);
        bpPatchMs = Date.now() - bpStart;

        if (
          !beyondPresence.synced &&
          beyondPresence.reason?.includes("deferred")
        ) {
          void bpPromise
            .then((result) => {
              console.info(
                JSON.stringify({
                  event: "bp_patch_async_complete",
                  visitorId,
                  synced: result.synced,
                  reason: result.synced ? undefined : result.reason,
                  bpPatchMs: Date.now() - bpStart,
                })
              );
            })
            .catch((err) => {
              console.error(
                JSON.stringify({
                  event: "bp_patch_async_failed",
                  visitorId,
                  error: err instanceof Error ? err.message : String(err),
                })
              );
            });
        }
      } else {
        bpPatchMs = 0;
        beyondPresence = {
          synced: false,
          reason: "Beyond Presence sync skipped (pipeline ceiling)",
        };
        void bpPromise.catch((err) => {
          console.error(
            JSON.stringify({
              event: "bp_patch_async_failed",
              visitorId,
              error: err instanceof Error ? err.message : String(err),
            })
          );
        });
      }
    }

    const pipelineMs = Date.now() - started;

    console.info(
      JSON.stringify({
        event: "pipeline_timing",
        visitorId,
        businessId,
        crmWaitMs,
        intentMs,
        automationMs,
        bpPatchMs,
        pipelineMs,
        model: "gpt-4o-mini",
        cacheHit,
        fallbackUsed,
      })
    );

    const syncStatus: "complete" | "pending" | "failed" = beyondPresence.synced
      ? "complete"
      : !bpAgentId?.trim()
        ? "pending"
        : beyondPresence.reason?.includes("deferred") ||
            beyondPresence.reason?.includes("skipped")
          ? "pending"
          : "failed";

    return jsonSuccess({
      intelligence,
      syncStatus,
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
      pipelineMs,
      timing: {
        crmWaitMs,
        intentMs,
        automationMs,
        bpPatchMs,
      },
      automation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return jsonError(message, 500);
  }
}
