import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    return await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
  },
});

export const evaluateAndFire = mutation({
  args: {
    businessId: v.id("businesses"),
    visitorId: v.id("visitors"),
    intentScore: v.number(),
    visitorName: v.optional(v.string()),
    recommendedAction: v.optional(v.string()),
    sessionOutcome: v.optional(
      v.union(
        v.literal("converted"),
        v.literal("escalated"),
        v.literal("abandoned"),
        v.literal("informational")
      )
    ),
  },
  handler: async (ctx, args) => {
    const triggers = await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const fired: Array<{
      triggerId: string;
      webhookUrl: string;
      action: string;
    }> = [];

    for (const trigger of triggers) {
      let shouldFire = false;

      if (
        trigger.condition === "intent_score_above" &&
        trigger.threshold != null &&
        args.intentScore >= trigger.threshold
      ) {
        shouldFire = true;
      }

      if (trigger.condition === "churn_risk_detected") {
        const visitor = await ctx.db.get(args.visitorId);
        if (visitor?.crmData?.churnRisk === "high") {
          shouldFire = true;
        }
      }

      if (trigger.condition === "appointment_booked") {
        const action = args.recommendedAction?.toLowerCase() ?? "";
        if (
          args.sessionOutcome === "converted" ||
          action.includes("appointment") ||
          action.includes("booking") ||
          action.includes("account opening")
        ) {
          shouldFire = true;
        }
      }

      if (shouldFire && trigger.webhookUrl) {
        fired.push({
          triggerId: trigger._id,
          webhookUrl: trigger.webhookUrl,
          action: trigger.action,
        });
        await ctx.db.patch(trigger._id, { lastFiredAt: Date.now() });
      }
    }

    return { fired, firedTriggerIds: fired.map((f) => f.triggerId) };
  },
});

export const seedTriggers = mutation({
  args: {
    businessId: v.id("businesses"),
    slackWebhookUrl: v.string(),
  },
  handler: async (ctx, { businessId, slackWebhookUrl }) => {
    const existing = await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    if (existing.length > 0) return { skipped: true };

    await ctx.db.insert("triggers", {
      businessId,
      condition: "intent_score_above",
      threshold: 80,
      action: "slack_alert",
      webhookUrl: slackWebhookUrl,
      isActive: true,
    });

    return { created: true };
  },
});
