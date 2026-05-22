import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireBusinessMember } from "./lib/auth";

/** Internal helper — call from other mutations to append an audit event. */
export async function appendAuditEvent(
  ctx: MutationCtx,
  args: {
    businessId: Id<"businesses">;
    actorClerkUserId: string;
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await ctx.db.insert("auditLog", {
    businessId: args.businessId,
    actorClerkUserId: args.actorClerkUserId,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    metadata: args.metadata ? JSON.stringify(args.metadata) : undefined,
    at: Date.now(),
  });
}

/** Server-side audit insert (no Clerk identity required). Use sparingly. */
export const recordSystemEvent = mutation({
  args: {
    businessId: v.id("businesses"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLog", {
      businessId: args.businessId,
      actorClerkUserId: "system",
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      metadata: args.metadataJson,
      at: Date.now(),
    });
    return { recorded: true };
  },
});

export const recordEvent = mutation({
  args: {
    businessId: v.id("businesses"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireBusinessMember(ctx, args.businessId);
    await ctx.db.insert("auditLog", {
      businessId: args.businessId,
      actorClerkUserId: identity.subject,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      metadata: args.metadataJson,
      at: Date.now(),
    });
    return { recorded: true };
  },
});

export const listForBusiness = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { businessId, limit }) => {
    await requireBusinessMember(ctx, businessId);
    return await ctx.db
      .query("auditLog")
      .withIndex("by_business_at", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(limit ?? 50);
  },
});
