import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";

async function businessForPreviewEmbed(ctx: QueryCtx, embedKey: string) {
  const business = await ctx.db
    .query("businesses")
    .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
    .unique();
  if (!business) {
    throw new Error("Unknown embedKey");
  }
  return business;
}

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
  },
});

export const listByBusinessDemo = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);
    return await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
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

const triggerCondition = v.union(
  v.literal("intent_score_above"),
  v.literal("churn_risk_detected"),
  v.literal("appointment_booked")
);

const triggerAction = v.union(
  v.literal("slack_alert"),
  v.literal("crm_push"),
  v.literal("email_sequence")
);

export const upsertTrigger = mutation({
  args: {
    businessId: v.id("businesses"),
    triggerId: v.optional(v.id("triggers")),
    condition: triggerCondition,
    threshold: v.optional(v.number()),
    action: triggerAction,
    webhookUrl: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireBusinessMember(ctx, args.businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    if (args.triggerId) {
      const existing = await ctx.db.get(args.triggerId);
      if (!existing || existing.businessId !== args.businessId) {
        throw new Error("Trigger not found");
      }
      await ctx.db.patch(args.triggerId, {
        condition: args.condition,
        threshold: args.threshold,
        action: args.action,
        webhookUrl: args.webhookUrl,
        isActive: args.isActive,
      });
      return { triggerId: args.triggerId };
    }

    const triggerId = await ctx.db.insert("triggers", {
      businessId: args.businessId,
      condition: args.condition,
      threshold: args.threshold,
      action: args.action,
      webhookUrl: args.webhookUrl,
      isActive: args.isActive,
    });
    return { triggerId };
  },
});

export const deleteTrigger = mutation({
  args: {
    businessId: v.id("businesses"),
    triggerId: v.id("triggers"),
  },
  handler: async (ctx, { businessId, triggerId }) => {
    const { membership } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const existing = await ctx.db.get(triggerId);
    if (!existing || existing.businessId !== businessId) {
      throw new Error("Trigger not found");
    }

    await ctx.db.delete(triggerId);
    return { deleted: true };
  },
});
