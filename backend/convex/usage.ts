import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";

export type PlanTier = "starter" | "growth" | "enterprise";

const PLAN_LIMITS: Record<PlanTier, number> = {
  starter: 500,
  growth: 25_000,
  enterprise: 1_000_000,
};

const PLAN_MODELS: Record<PlanTier, "gpt-4o-mini" | "gpt-4o"> = {
  starter: "gpt-4o-mini",
  growth: "gpt-4o-mini",
  enterprise: "gpt-4o",
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function defaultCredits(planTier: PlanTier) {
  const now = Date.now();
  return {
    intelligenceCallsRemaining: PLAN_LIMITS[planTier],
    intelligenceCallsLimit: PLAN_LIMITS[planTier],
    periodStart: now,
    periodEnd: now + MONTH_MS,
  };
}

export function resolvePlanTier(business: Doc<"businesses">): PlanTier {
  return business.planTier ?? "starter";
}

export function ensureCredits(business: Doc<"businesses">) {
  const tier = resolvePlanTier(business);
  const now = Date.now();
  if (
    business.credits &&
    business.credits.periodEnd > now &&
    business.credits.intelligenceCallsLimit > 0
  ) {
    return business.credits;
  }
  return defaultCredits(tier);
}

export function resolveOpenAiModel(business: Doc<"businesses">): "gpt-4o-mini" | "gpt-4o" {
  if (business.openAiModel) return business.openAiModel;
  return PLAN_MODELS[resolvePlanTier(business)];
}

export const seedDefaultUsage = mutation({
  args: {
    businessId: v.id("businesses"),
    planTier: v.optional(
      v.union(v.literal("starter"), v.literal("growth"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, { businessId, planTier: tierArg }) => {
    const business = await ctx.db.get(businessId);
    if (!business) throw new Error("Business not found");
    const planTier = tierArg ?? resolvePlanTier(business);
    await ctx.db.patch(businessId, {
      planTier,
      credits: defaultCredits(planTier),
      openAiModel: PLAN_MODELS[planTier],
    });
    return { planTier };
  },
});

function balanceFromBusiness(business: Doc<"businesses">) {
  const credits = ensureCredits(business);
  return {
    remaining: credits.intelligenceCallsRemaining,
    limit: credits.intelligenceCallsLimit,
    planTier: resolvePlanTier(business),
    model: resolveOpenAiModel(business),
    periodEnd: credits.periodEnd,
  };
}

export const getBalance = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const business = await ctx.db.get(businessId);
    if (!business) return null;
    return balanceFromBusiness(business);
  },
});

export const getBalanceByEmbedKey = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();
    if (!business) return null;
    return balanceFromBusiness(business);
  },
});

/** Called from Next.js pipeline before OpenAI — no auth (server secret via Convex deploy). */
export const checkAndConsume = mutation({
  args: {
    businessId: v.id("businesses"),
    type: v.literal("intelligence_call"),
  },
  handler: async (ctx, { businessId, type }) => {
    const business = await ctx.db.get(businessId);
    if (!business) throw new Error("Business not found");

    const tier = resolvePlanTier(business);
    let credits = ensureCredits(business);

    if (credits.intelligenceCallsRemaining <= 0) {
      throw new Error("CreditsExhausted");
    }

    const nextRemaining = credits.intelligenceCallsRemaining - 1;
    credits = { ...credits, intelligenceCallsRemaining: nextRemaining };

    await ctx.db.patch(businessId, { credits });
    await ctx.db.insert("usageEvents", {
      businessId,
      type,
      model: resolveOpenAiModel(business),
      createdAt: Date.now(),
    });

    return {
      remaining: nextRemaining,
      limit: credits.intelligenceCallsLimit,
      model: resolveOpenAiModel(business),
      planTier: tier,
    };
  },
});
