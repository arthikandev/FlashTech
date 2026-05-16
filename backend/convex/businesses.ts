import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember, requireIdentity } from "./lib/auth";

const industry = v.union(
  v.literal("bank"),
  v.literal("saas"),
  v.literal("hotel"),
  v.literal("hospital"),
  v.literal("ecommerce"),
  v.literal("hr")
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
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

export const createBusiness = mutation({
  args: {
    name: v.string(),
    industry,
    personaTone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    embedKey: v.optional(v.string()),
    bpAgentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseKey = args.embedKey?.trim() || slugify(args.name);
    const embedKey = await uniqueEmbedKey(ctx, baseKey || "business");

    const bpAgentId = args.bpAgentId?.trim();
    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      industry: args.industry,
      embedKey,
      avatarConfig: {
        personaTone: args.personaTone ?? "professional",
        defaultLanguage: args.defaultLanguage ?? "en",
        ...(bpAgentId ? { bpAgentId } : {}),
      },
      knowledgeChunks: [],
      webhookUrls: {},
      createdAt: Date.now(),
    });

    return { businessId, embedKey };
  },
});

export const getByEmbedKey = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();
  },
});

export const getById = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    return await ctx.db.get(businessId);
  },
});

const webhookUrls = v.object({
  n8nCrmFetch: v.optional(v.string()),
  n8nCrmPush: v.optional(v.string()),
  n8nSlack: v.optional(v.string()),
});

export const onboardBusiness = mutation({
  args: {
    name: v.string(),
    industry,
    personaTone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    embedKey: v.optional(v.string()),
    bpAgentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const baseKey = args.embedKey?.trim() || slugify(args.name);
    const embedKey = await uniqueEmbedKey(ctx, baseKey || "business");
    const bpAgentId = args.bpAgentId?.trim();

    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      industry: args.industry,
      embedKey,
      avatarConfig: {
        personaTone: args.personaTone ?? "professional",
        defaultLanguage: args.defaultLanguage ?? "en",
        ...(bpAgentId ? { bpAgentId } : {}),
      },
      knowledgeChunks: [],
      webhookUrls: {},
      createdAt: Date.now(),
    });

    await ctx.db.insert("businessMembers", {
      clerkUserId: identity.subject,
      businessId,
      role: "admin",
      createdAt: Date.now(),
    });

    return { businessId, embedKey };
  },
});

export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.optional(v.string()),
    industry: v.optional(industry),
    personaTone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    bpAgentId: v.optional(v.string()),
    webhookUrls: v.optional(webhookUrls),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireBusinessMember(ctx, args.businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const avatarConfig = { ...business.avatarConfig };
    if (args.personaTone !== undefined) avatarConfig.personaTone = args.personaTone;
    if (args.defaultLanguage !== undefined) avatarConfig.defaultLanguage = args.defaultLanguage;
    if (args.bpAgentId !== undefined) {
      const trimmed = args.bpAgentId.trim();
      if (trimmed) avatarConfig.bpAgentId = trimmed;
      else delete avatarConfig.bpAgentId;
    }

    await ctx.db.patch(args.businessId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.industry !== undefined ? { industry: args.industry } : {}),
      avatarConfig,
      ...(args.webhookUrls !== undefined
        ? { webhookUrls: { ...business.webhookUrls, ...args.webhookUrls } }
        : {}),
    });

    return { ok: true as const };
  },
});
