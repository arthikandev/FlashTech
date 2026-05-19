import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { runPipelineAutomation } from "@/lib/automation";
import {
  resolveSyncStatus,
  syncAgentFromIntelligence,
  type SyncAgentContextResult,
} from "@/lib/beyondPresenceApi";
import { pickKnowledgeContextAsync } from "@/lib/knowledge";
import { selectVoiceForContext } from "@/lib/elevenlabs";
import { intentToVoiceTone, toneToPersonaHint } from "@/lib/tone";
import { checkRateLimit } from "@/lib/rateLimit";
import { runIntentPipeline, waitForCrmData } from "@/lib/pipeline";
import { api, getConvexClient } from "@/lib/convex";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
  waitForCrmMs: z.number().optional().default(200),
  operatorMessage: z.string().max(2000).optional(),
});

const PIPELINE_CEILING_MS = Number(
  process.env.PRESENCEIQ_PIPELINE_CEILING_MS ?? 1500
);

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const started = Date.now();
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`pipeline:ip:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const visitorId = body.visitorId as Id<"visitors">;
    const businessId = body.businessId as Id<"businesses">;

    if (!checkRateLimit(`pipeline:tenant:${businessId}:${ip}`)) {
      return jsonError("Rate limit exceeded", 429);
    }

    const t0 = Date.now();
    await waitForCrmData(visitorId, body.waitForCrmMs);
    const crmWaitMs = Date.now() - t0;

    const convex = getConvexClient();
    let usageModel = "gpt-4o-mini";
    try {
      const usage = await convex.mutation(api.usage.checkAndConsume, {
        businessId,
        type: "intelligence_call",
      });
      usageModel = usage.model;
    } catch (consumeErr) {
      const msg =
        consumeErr instanceof Error ? consumeErr.message : String(consumeErr);
      if (msg.includes("CreditsExhausted")) {
        return jsonError("Intelligence credits exhausted for this billing period", 402);
      }
      throw consumeErr;
    }

    const t1 = Date.now();
    const { intelligence, visitor, business } = await runIntentPipeline(
      visitorId,
      businessId,
      { operatorMessage: body.operatorMessage, model: usageModel }
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

    const voiceTone = intentToVoiceTone({
      intentScore: intelligence.intentScore,
      industry: business.industry,
      churnRisk: visitor.crmData?.churnRisk,
    });
    const personaTone =
      business.avatarConfig.personaTone ?? toneToPersonaHint(voiceTone);
    const voiceToneHint = toneToPersonaHint(voiceTone);
    const voiceSelection = selectVoiceForContext({
      industry: business.industry,
      language: visitor.language,
      tone: voiceTone,
    });
    const bpAgentId = business.avatarConfig.bpAgentId;
    const useNativeBpAgent = business.avatarConfig.useNativeBpAgent === true;

    const knowledgeContext = await pickKnowledgeContextAsync({
      chunks: business.knowledgeChunks ?? [],
      pageHistory: visitor.pageHistory,
      crmNotes: visitor.crmData?.notes,
    });

    let beyondPresence: SyncAgentContextResult = {
      synced: false,
      reason: "bpAgentId not set on business",
    };
    let bpPatchMs = 0;

    if (bpAgentId?.trim()) {
      const bpStart = Date.now();
      // useNativeBpAgent → still PATCH the greeting so the avatar speaks
      // the personalised opener; just don't overwrite the dashboard's
      // system prompt.
      const bpPromise = syncAgentFromIntelligence({
        bpAgentId,
        businessName: business.name,
        personaTone,
        voiceToneHint,
        visitorName: visitor.crmData?.name,
        language: visitor.language,
        intentScore: intelligence.intentScore,
        recommendedAction: intelligence.recommendedAction,
        personalisedOpener: intelligence.personalisedOpener,
        knowledgeContext,
        greetingOnly: useNativeBpAgent,
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
        model: usageModel,
        cacheHit,
        fallbackUsed,
      })
    );

    // Record the run in the audit log so admins can see route distribution.
    const route = fallbackUsed ? "heuristic" : cacheHit ? "cached" : "live";
    void convex
      .mutation(api.audit.recordSystemEvent, {
        businessId,
        action: "pipeline.run",
        targetType: "visitor",
        targetId: visitorId,
        metadataJson: JSON.stringify({
          route,
          intentScore: intelligence.intentScore,
          bpSynced: beyondPresence.synced,
          bpPartial:
            beyondPresence.synced && "partial" in beyondPresence
              ? beyondPresence.partial === true
              : false,
          pipelineMs,
          intentMs,
          bpPatchMs,
        }),
      })
      .catch((err) => {
        console.warn("[pipeline] audit.recordSystemEvent failed", err);
      });

    const syncStatus = resolveSyncStatus({ result: beyondPresence, bpAgentId });

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
      voice: {
        voiceId: voiceSelection.voiceId,
        tone: voiceTone,
        label: voiceSelection.label,
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
