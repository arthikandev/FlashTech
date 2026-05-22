import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";
import { appendAuditEvent } from "./audit";

function randomSegment(): string {
  return Math.random().toString(36).slice(2, 8);
}

async function uniqueEmbedKey(
  ctx: { db: import("./_generated/server").MutationCtx["db"] },
  base: string
): Promise<string> {
  let candidate = base;
  let n = 0;
  while (true) {
    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", candidate))
      .unique();
    if (!existing) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export const rotateEmbedKey = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const business = await ctx.db.get(businessId);
    if (!business) throw new Error("Business not found");

    const previous = business.embedKey;
    const base = business.embedKey.split("-").slice(0, 2).join("-") || "biz";
    const candidate = `${base}-${randomSegment()}`;
    const next = await uniqueEmbedKey(ctx, candidate);

    await ctx.db.patch(businessId, { embedKey: next });
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "embed.key_rotated",
      targetType: "business",
      targetId: businessId,
      metadata: { previous, next },
    });

    return { previous, next };
  },
});

export const updateAvatarConfig = mutation({
  args: {
    businessId: v.id("businesses"),
    personaTone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    bpAgentId: v.optional(v.string()),
    useNativeBpAgent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership, identity } = await requireBusinessMember(
      ctx,
      args.businessId
    );
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");

    const merged = {
      ...business.avatarConfig,
      personaTone:
        args.personaTone !== undefined
          ? args.personaTone
          : business.avatarConfig?.personaTone,
      defaultLanguage:
        args.defaultLanguage !== undefined
          ? args.defaultLanguage
          : business.avatarConfig?.defaultLanguage,
      bpAgentId:
        args.bpAgentId !== undefined
          ? args.bpAgentId
          : business.avatarConfig?.bpAgentId,
      useNativeBpAgent:
        args.useNativeBpAgent !== undefined
          ? args.useNativeBpAgent
          : business.avatarConfig?.useNativeBpAgent,
    };

    await ctx.db.patch(args.businessId, { avatarConfig: merged });
    await appendAuditEvent(ctx, {
      businessId: args.businessId,
      actorClerkUserId: identity.subject,
      action: "embed.avatar_config_updated",
      targetType: "business",
      targetId: args.businessId,
    });

    return { ok: true };
  },
});
