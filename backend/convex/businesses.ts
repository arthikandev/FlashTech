import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember, requireIdentity } from "./lib/auth";
import {
  categoryCodeFromIndustry,
  type IndustryKey,
} from "./lib/categoriesData";
import { CANONICAL_BP_AGENT_ID } from "./lib/bpAgentDefaults";
import { businessWebhookUrls } from "./lib/webhookUrls";

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
    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      industry: args.industry,
      categoryCode: categoryCodeFromIndustry(args.industry as IndustryKey),
      embedKey,
      avatarConfig: {
        personaTone: args.personaTone ?? "professional",
        defaultLanguage: args.defaultLanguage ?? "en",
        ...(bpAgentId ? { bpAgentId } : {}),
      },
      knowledgeChunks: [],
      webhookUrls: {},
      planTier: "starter",
      openAiModel: "gpt-4o-mini",
      credits: {
        intelligenceCallsRemaining: 500,
        intelligenceCallsLimit: 500,
        periodStart: now,
        periodEnd: now + monthMs,
      },
      createdAt: now,
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

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      industry: args.industry,
      categoryCode: categoryCodeFromIndustry(args.industry as IndustryKey),
      embedKey,
      avatarConfig: {
        personaTone: args.personaTone ?? "professional",
        defaultLanguage: args.defaultLanguage ?? "en",
        ...(bpAgentId ? { bpAgentId } : {}),
      },
      knowledgeChunks: [],
      webhookUrls: {},
      planTier: "starter",
      openAiModel: "gpt-4o-mini",
      credits: {
        intelligenceCallsRemaining: 500,
        intelligenceCallsLimit: 500,
        periodStart: now,
        periodEnd: now + monthMs,
      },
      createdAt: now,
    });

    await ctx.db.insert("businessMembers", {
      clerkUserId: identity.subject,
      businessId,
      role: "admin",
      createdAt: now,
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
    useNativeBpAgent: v.optional(v.boolean()),
    webhookUrls: v.optional(businessWebhookUrls),
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
    if (args.useNativeBpAgent !== undefined) {
      avatarConfig.useNativeBpAgent = args.useNativeBpAgent;
    }

    await ctx.db.patch(args.businessId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.industry !== undefined
        ? {
            industry: args.industry,
            categoryCode: categoryCodeFromIndustry(args.industry as IndustryKey),
          }
        : {}),
      avatarConfig,
      ...(args.webhookUrls !== undefined
        ? { webhookUrls: { ...business.webhookUrls, ...args.webhookUrls } }
        : {}),
    });

    return { ok: true as const };
  },
});

/** Ops: set BP agent + native mode for a workspace by embed key. */
export const setBpAgentForEmbedKey = mutation({
  args: {
    embedKey: v.string(),
    bpAgentId: v.string(),
    useNativeBpAgent: v.optional(v.boolean()),
  },
  handler: async (ctx, { embedKey, bpAgentId, useNativeBpAgent }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();
    if (!business) {
      throw new Error(`Unknown embedKey: ${embedKey}`);
    }
    const trimmed = bpAgentId.trim();
    if (!trimmed) {
      throw new Error("bpAgentId is required");
    }
    await ctx.db.patch(business._id, {
      avatarConfig: {
        ...business.avatarConfig,
        bpAgentId: trimmed,
        ...(useNativeBpAgent !== undefined ? { useNativeBpAgent } : {}),
      },
    });
    return { businessId: business._id, embedKey: business.embedKey };
  },
});

const knowledgeChunk = v.object({
  id: v.string(),
  text: v.string(),
  embeddingId: v.optional(v.string()),
});

/** Replace workspace knowledge; first save from empty sets default BP agent if unset. */
export const updateKnowledgeChunks = mutation({
  args: {
    businessId: v.id("businesses"),
    knowledgeChunks: v.array(knowledgeChunk),
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

    const wasEmpty = business.knowledgeChunks.length === 0;
    const nowHasChunks = args.knowledgeChunks.length > 0;
    const avatarConfig = { ...business.avatarConfig };
    if (
      wasEmpty &&
      nowHasChunks &&
      !business.avatarConfig.bpAgentId?.trim()
    ) {
      avatarConfig.bpAgentId = CANONICAL_BP_AGENT_ID;
    }

    await ctx.db.patch(args.businessId, {
      knowledgeChunks: args.knowledgeChunks,
      avatarConfig,
    });

    return { ok: true as const };
  },
});
