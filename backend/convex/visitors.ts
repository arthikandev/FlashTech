import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const crmDataValidator = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  accountType: v.optional(v.string()),
  churnRisk: v.optional(v.string()),
  lastPurchase: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const upsertFingerprint = mutation({
  args: {
    embedKey: v.string(),
    fingerprint: v.string(),
    path: v.string(),
    title: v.optional(v.string()),
    language: v.string(),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", args.embedKey))
      .unique();

    if (!business) {
      throw new Error(`Unknown embedKey: ${args.embedKey}`);
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("visitors")
      .withIndex("by_fingerprint_and_business", (q) =>
        q.eq("fingerprint", args.fingerprint).eq("businessId", business._id)
      )
      .unique();

    const pageEntry = {
      path: args.path,
      title: args.title,
      enteredAt: now,
    };

    if (existing) {
      const pageHistory = [...existing.pageHistory, pageEntry].slice(-50);
      await ctx.db.patch(existing._id, {
        pageHistory,
        returnCount: existing.returnCount + 1,
        language: args.language,
        ...(args.referrer !== undefined ? { referrer: args.referrer } : {}),
        lastSeenAt: now,
      });
      return {
        visitorId: existing._id,
        businessId: business._id,
        returnCount: existing.returnCount + 1,
        isKnownVisitor: Boolean(existing.crmId || existing.crmData?.name),
        crmId: existing.crmId,
        sessionId: `${existing._id}-${now}`,
      };
    }

    const visitorId = await ctx.db.insert("visitors", {
      fingerprint: args.fingerprint,
      businessId: business._id,
      pageHistory: [pageEntry],
      timeOnSite: 0,
      returnCount: 1,
      language: args.language,
      referrer: args.referrer,
      lastSeenAt: now,
      createdAt: now,
    });

    return {
      visitorId,
      businessId: business._id,
      returnCount: 1,
      isKnownVisitor: false,
      crmId: undefined,
      sessionId: `${visitorId}-${now}`,
    };
  },
});

export const trackTimeOnSite = mutation({
  args: {
    visitorId: v.id("visitors"),
    additionalMs: v.number(),
  },
  handler: async (ctx, { visitorId, additionalMs }) => {
    const visitor = await ctx.db.get(visitorId);
    if (!visitor) return;
    await ctx.db.patch(visitorId, {
      timeOnSite: visitor.timeOnSite + additionalMs,
      lastSeenAt: Date.now(),
    });
  },
});

export const patchCrmData = mutation({
  args: {
    visitorId: v.id("visitors"),
    crmId: v.string(),
    crmData: crmDataValidator,
  },
  handler: async (ctx, { visitorId, crmId, crmData }) => {
    await ctx.db.patch(visitorId, { crmId, crmData });
    return { success: true };
  },
});

export const getByFingerprint = query({
  args: {
    fingerprint: v.string(),
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { fingerprint, businessId }) => {
    return await ctx.db
      .query("visitors")
      .withIndex("by_fingerprint_and_business", (q) =>
        q.eq("fingerprint", fingerprint).eq("businessId", businessId)
      )
      .unique();
  },
});

export const getById = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    return await ctx.db.get(visitorId);
  },
});
