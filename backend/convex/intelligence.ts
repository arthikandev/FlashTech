import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";

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

/** Resolve business for unsigned dashboard preview (any tenant with this embed key). */
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

function formatPageTrail(
  pageHistory: Array<{ path: string; title?: string }>,
  max = 4
): string {
  const slice = pageHistory.slice(-max);
  if (slice.length === 0) return "—";
  return slice
    .map((p) => p.title?.trim() || p.path.split("/").filter(Boolean).pop() || p.path)
    .join(" → ");
}

async function listSessionsForBusiness(ctx: QueryCtx, businessId: Id<"businesses">) {
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
      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_visitor", (q) => q.eq("visitorId", visitor._id))
        .order("desc")
        .take(1);
      const crm = visitor.crmData;
      return {
        visitorId: visitor._id,
        fingerprint: visitor.fingerprint,
        name: crm?.name,
        intentScore: intel[0]?.intentScore,
        personalisedOpener: intel[0]?.personalisedOpener,
        recommendedAction: intel[0]?.recommendedAction,
        signals: intel[0]?.signals,
        returnCount: visitor.returnCount,
        lastSeenAt: visitor.lastSeenAt,
        language: visitor.language,
        pageTrail: formatPageTrail(visitor.pageHistory),
        crmAccountType: crm?.accountType,
        crmChurnRisk: crm?.churnRisk,
        hasConversation: conversation.length > 0,
        conversationOutcome: conversation[0]?.outcome,
        conversationDuration: conversation[0]?.duration,
      };
    })
  );

  return sessions.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

export const listLiveSessionsDemo = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);
    return listSessionsForBusiness(ctx, business._id);
  },
});

export const listLiveSessions = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return listSessionsForBusiness(ctx, businessId);
  },
});

export const getSessionDetailDemo = query({
  args: { embedKey: v.string(), visitorId: v.id("visitors") },
  handler: async (ctx, { embedKey, visitorId }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);

    const visitor = await ctx.db.get(visitorId);
    if (!visitor || visitor.businessId !== business._id) return null;

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

    return {
      visitor,
      business,
      intelligence: intelligence[0] ?? null,
      conversation: conversations[0] ?? null,
    };
  },
});

export const getSessionDetail = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    const visitor = await ctx.db.get(visitorId);
    if (!visitor) return null;

    await requireBusinessMember(ctx, visitor.businessId);

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
    await requireBusinessMember(ctx, businessId);

    return await ctx.db
      .query("intelligence")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(100);
  },
});
