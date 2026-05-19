import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";
import { appendAuditEvent } from "./audit";

const planTier = v.union(
  v.literal("starter"),
  v.literal("growth"),
  v.literal("enterprise")
);

const PLAN_LIMITS = {
  starter: { intelligenceCallsLimit: 250, monthlyUsd: 0 },
  growth: { intelligenceCallsLimit: 2500, monthlyUsd: 49 },
  enterprise: { intelligenceCallsLimit: 25000, monthlyUsd: 499 },
} as const;

export const getPlanCatalog = query({
  args: {},
  handler: async () => {
    return Object.entries(PLAN_LIMITS).map(([tier, conf]) => ({
      tier,
      intelligenceCallsLimit: conf.intelligenceCallsLimit,
      monthlyUsd: conf.monthlyUsd,
    }));
  },
});

export const getBillingState = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const business = await ctx.db.get(businessId);
    if (!business) return null;

    const now = Date.now();
    const periodStart = business.credits?.periodStart ?? now;
    const periodEnd = business.credits?.periodEnd ?? now + 30 * 86400000;

    const events = await ctx.db
      .query("usageEvents")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const inPeriod = events.filter(
      (e) => e.createdAt >= periodStart && e.createdAt <= periodEnd
    );

    return {
      planTier: business.planTier ?? "starter",
      credits: business.credits ?? {
        intelligenceCallsRemaining:
          PLAN_LIMITS.starter.intelligenceCallsLimit,
        intelligenceCallsLimit: PLAN_LIMITS.starter.intelligenceCallsLimit,
        periodStart,
        periodEnd,
      },
      usageThisPeriod: {
        intelligenceCalls: inPeriod.filter(
          (e) => e.type === "intelligence_call"
        ).length,
        postCallAnalyses: inPeriod.filter(
          (e) => e.type === "post_call_analysis"
        ).length,
        connectorSyncs: inPeriod.filter((e) => e.type === "connector_sync")
          .length,
        totalEvents: inPeriod.length,
      },
    };
  },
});

export const setPlan = mutation({
  args: {
    businessId: v.id("businesses"),
    planTier,
  },
  handler: async (ctx, { businessId, planTier: tier }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const business = await ctx.db.get(businessId);
    if (!business) throw new Error("Business not found");

    const limit = PLAN_LIMITS[tier].intelligenceCallsLimit;
    const now = Date.now();

    await ctx.db.patch(businessId, {
      planTier: tier,
      credits: {
        intelligenceCallsRemaining: limit,
        intelligenceCallsLimit: limit,
        periodStart: now,
        periodEnd: now + 30 * 86400000,
      },
    });

    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "billing.plan_changed",
      targetType: "business",
      targetId: businessId,
      metadata: { tier },
    });

    return { planTier: tier, intelligenceCallsLimit: limit };
  },
});
