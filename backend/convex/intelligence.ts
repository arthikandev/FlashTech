import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveIntelligence = mutation({
  args: {
    visitorId: v.id("visitors"),
    businessId: v.id("businesses"),
    intentScore: v.number(),
    personalisedOpener: v.string(),
    recommendedAction: v.string(),
    signals: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const computedAt = Date.now();
    const id = await ctx.db.insert("intelligence", {
      ...args,
      computedAt,
    });
    return { intelligenceId: id, computedAt };
  },
});

export const getLatestByVisitor = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    const rows = await ctx.db
      .query("intelligence")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(1);
    return rows[0] ?? null;
  },
});

export const getIntelligenceForAvatar = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    const intelligence = await ctx.db
      .query("intelligence")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(1);
    const visitor = await ctx.db.get(visitorId);
    if (!visitor) return null;
    const business = await ctx.db.get(visitor.businessId);
    return {
      intelligence: intelligence[0] ?? null,
      visitor,
      business,
    };
  },
});

export const listLiveSessions = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(50);

    const sessions = await Promise.all(
      visitors.map(async (visitor) => {
        const intel = await ctx.db
          .query("intelligence")
          .withIndex("by_visitor", (q) => q.eq("visitorId", visitor._id))
          .order("desc")
          .take(1);
        return {
          visitorId: visitor._id,
          fingerprint: visitor.fingerprint,
          name: visitor.crmData?.name,
          intentScore: intel[0]?.intentScore,
          personalisedOpener: intel[0]?.personalisedOpener,
          recommendedAction: intel[0]?.recommendedAction,
          returnCount: visitor.returnCount,
          lastSeenAt: visitor.lastSeenAt,
          language: visitor.language,
        };
      })
    );

    return sessions.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  },
});

export const getSessionDetail = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    const visitor = await ctx.db.get(visitorId);
    if (!visitor) return null;

    const intelligence = await ctx.db
      .query("intelligence")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(1);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(1);

    const business = await ctx.db.get(visitor.businessId);

    return {
      visitor,
      business,
      intelligence: intelligence[0] ?? null,
      conversation: conversations[0] ?? null,
    };
  },
});

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    return await ctx.db
      .query("intelligence")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(100);
  },
});
