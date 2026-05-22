import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember, requireIdentity } from "./lib/auth";
import {
  categoryCodeFromIndustry,
  type IndustryKey,
} from "./lib/categoriesData";
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

    const template = await ctx.db
      .query("industryTemplates")
      .withIndex("by_industry", (q) => q.eq("industry", args.industry))
      .unique();

    if (template) {
      const explicitPersona = !!args.personaTone;
      const explicitLanguage = !!args.defaultLanguage;
      if (!explicitPersona || !explicitLanguage) {
        await ctx.db.patch(businessId, {
          avatarConfig: {
            personaTone: explicitPersona
              ? args.personaTone
              : template.personaTone,
            defaultLanguage: explicitLanguage
              ? args.defaultLanguage
              : template.defaultLanguage,
            ...(bpAgentId ? { bpAgentId } : {}),
          },
        });
      }

      for (const dt of template.defaultTriggers) {
        await ctx.db.insert("triggers", {
          businessId,
          condition: dt.condition,
          threshold: dt.threshold,
          action: dt.action,
          webhookUrl: "",
          isActive: false,
        });
      }

      await ctx.db.insert("auditLog", {
        businessId,
        actorClerkUserId: identity.subject,
        action: "industry_defaults.applied_on_onboard",
        targetType: "business",
        targetId: businessId,
        metadata: JSON.stringify({
          industry: args.industry,
          triggersCreated: template.defaultTriggers.length,
        }),
        at: now,
      });
    }

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
      // Strip pasted `https://bey.chat/<id>` URL form to a bare ID.
      const urlMatch = trimmed.match(
        /^https?:\/\/(?:app\.)?bey\.chat\/([^/?#]+)/i
      );
      const normalized = (urlMatch ? urlMatch[1] : trimmed).replace(/\s+/g, "");
      if (normalized) avatarConfig.bpAgentId = normalized;
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

/** Ops: clear stale demo agent UUIDs left in `avatarConfig.bpAgentId` from
 *  prior deployments. Run once: `npx convex run businesses:clearLegacyBpAgents`. */
// The ID `9fe4cbe8-...` collides with a real customer agent ("Suha") on at
// least one production workspace, so it is NOT in this set. Only sweep the
// `694c83e...` UUID, which was the bundled demo default.
const LEGACY_BP_AGENT_IDS = new Set([
  "694c83e2-8895-4a98-bd16-56332ca3f449",
]);

export const clearLegacyBpAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("businesses").collect();
    let cleared = 0;
    for (const business of all) {
      const id = business.avatarConfig?.bpAgentId?.trim();
      if (id && LEGACY_BP_AGENT_IDS.has(id)) {
        const next = { ...business.avatarConfig };
        delete next.bpAgentId;
        next.useNativeBpAgent = false;
        await ctx.db.patch(business._id, { avatarConfig: next });
        cleared += 1;
      }
    }
    return { cleared };
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

/** Ops: delete a business by embedKey, cascading to all dependent rows. */
export const deleteByEmbedKey = mutation({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();
    if (!business) {
      return { ok: true as const, deleted: false };
    }
    const businessId = business._id;

    const members = await ctx.db
      .query("businessMembers")
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .collect();
    for (const m of members) await ctx.db.delete(m._id);

    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const v of visitors) await ctx.db.delete(v._id);

    const intel = await ctx.db
      .query("intelligence")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const r of intel) await ctx.db.delete(r._id);

    const convs = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const r of convs) await ctx.db.delete(r._id);

    const usage = await ctx.db
      .query("usageEvents")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const r of usage) await ctx.db.delete(r._id);

    const trigs = await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const r of trigs) await ctx.db.delete(r._id);

    const clientRows = await ctx.db
      .query("clients")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    for (const r of clientRows) await ctx.db.delete(r._id);

    await ctx.db.delete(businessId);
    return { ok: true as const, deleted: true, businessId };
  },
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

    await ctx.db.patch(args.businessId, {
      knowledgeChunks: args.knowledgeChunks,
    });

    return { ok: true as const };
  },
});
