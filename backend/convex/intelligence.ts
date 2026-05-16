import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
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

async function visitorToLiveSession(ctx: QueryCtx, visitor: Doc<"visitors">) {
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
}

async function listSessionsForBusiness(ctx: QueryCtx, businessId: Id<"businesses">) {
  const visitors = await ctx.db
    .query("visitors")
    .withIndex("by_business_lastSeen", (q) => q.eq("businessId", businessId))
    .order("desc")
    .take(50);

  const sessions = await Promise.all(visitors.map((v) => visitorToLiveSession(ctx, v)));
  return sessions.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

async function paginateSessionsForBusiness(
  ctx: QueryCtx,
  businessId: Id<"businesses">,
  paginationOpts: { numItems: number; cursor: string | null }
) {
  const page = await ctx.db
    .query("visitors")
    .withIndex("by_business_lastSeen", (q) => q.eq("businessId", businessId))
    .order("desc")
    .paginate(paginationOpts);

  const sessions = await Promise.all(page.page.map((v) => visitorToLiveSession(ctx, v)));

  return {
    ...page,
    page: sessions,
  };
}

/** Supports paginated clients and legacy `{ embedKey }` / `{ businessId }` callers. */
async function resolveSessionsPage(
  ctx: QueryCtx,
  businessId: Id<"businesses">,
  paginationOpts?: { numItems: number; cursor: string | null }
) {
  if (paginationOpts !== undefined) {
    return paginateSessionsForBusiness(ctx, businessId, paginationOpts);
  }
  const sessions = await listSessionsForBusiness(ctx, businessId);
  return {
    page: sessions,
    isDone: true,
    continueCursor: "",
  };
}

export const listLiveSessionsDemo = query({
  args: {
    embedKey: v.string(),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, { embedKey, paginationOpts }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);
    return resolveSessionsPage(ctx, business._id, paginationOpts);
  },
});

export const listLiveSessions = query({
  args: {
    businessId: v.id("businesses"),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, { businessId, paginationOpts }) => {
    await requireBusinessMember(ctx, businessId);
    return resolveSessionsPage(ctx, businessId, paginationOpts);
  },
});

/** Up to 50 recent visitors for charts — not paginated. */
export const listAnalyticsSessions = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return listSessionsForBusiness(ctx, businessId);
  },
});

export const listAnalyticsSessionsDemo = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);
    return listSessionsForBusiness(ctx, business._id);
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

const HOT_LEAD_THRESHOLD = 80;

export const dashboardStats = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const sessions = await listSessionsForBusiness(ctx, businessId);

    const withScore = sessions.filter((s) => s.intentScore != null);
    const avgIntent =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((a, s) => a + (s.intentScore ?? 0), 0) / withScore.length
          )
        : null;
    const conversations = sessions.filter((s) => s.hasConversation).length;
    const hotLeadRate =
      sessions.length > 0
        ? Math.round(
            (sessions.filter((s) => (s.intentScore ?? 0) >= HOT_LEAD_THRESHOLD).length /
              sessions.length) *
              100
          )
        : null;
    const converted = sessions.filter((s) => s.conversationOutcome === "converted").length;
    const conversionRate =
      conversations > 0 ? Math.round((converted / conversations) * 100) : null;

    return {
      liveVisitors: sessions.length,
      conversations,
      hotLeadRate,
      avgIntent,
      conversionRate,
    };
  },
});

export const dashboardStatsDemo = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await businessForPreviewEmbed(ctx, embedKey);
    const sessions = await listSessionsForBusiness(ctx, business._id);

    const withScore = sessions.filter((s) => s.intentScore != null);
    const avgIntent =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((a, s) => a + (s.intentScore ?? 0), 0) / withScore.length
          )
        : null;
    const conversations = sessions.filter((s) => s.hasConversation).length;
    const hotLeadRate =
      sessions.length > 0
        ? Math.round(
            (sessions.filter((s) => (s.intentScore ?? 0) >= HOT_LEAD_THRESHOLD).length /
              sessions.length) *
              100
          )
        : null;
    const converted = sessions.filter((s) => s.conversationOutcome === "converted").length;
    const conversionRate =
      conversations > 0 ? Math.round((converted / conversations) * 100) : null;

    return {
      liveVisitors: sessions.length,
      conversations,
      hotLeadRate,
      avgIntent,
      conversionRate,
    };
  },
});
