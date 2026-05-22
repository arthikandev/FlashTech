import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember, requireIdentity } from "./lib/auth";
import {
  categoryCodeFromIndustry,
  type IndustryKey,
} from "./lib/categoriesData";
import { ensurePlatformCategoriesSeeded } from "./lib/ensureCategoriesSeeded";
import { businessWebhookUrls } from "./lib/webhookUrls";

const industry = v.union(
  v.literal("bank"),
  v.literal("saas"),
  v.literal("hotel"),
  v.literal("hospital"),
  v.literal("ecommerce"),
  v.literal("hr")
);

const verificationBadge: Record<string, string> = {
  BANKING_FINANCIAL: "Verified Bank",
  SAAS_SOFTWARE: "Pro Tier",
  HOTELS_TOURISM: "Verified Hotel",
  HEALTHCARE: "Verified Health",
  ECOMMERCE_RETAIL: "Pro Tier",
  HR_RECRUITMENT: "Enterprise",
};

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

async function categoryRowForIndustry(
  ctx: { db: import("./_generated/server").MutationCtx["db"] },
  industryKey: IndustryKey
) {
  const code = categoryCodeFromIndustry(industryKey);
  const category = await ctx.db
    .query("categories")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();
  if (!category) {
    throw new Error(`Category not seeded for industry: ${industryKey}`);
  }
  return category;
}

/** Signed-in user creates client workspace (business + client + membership). */
export const createAccount = mutation({
  args: {
    businessName: v.string(),
    industry,
    website: v.optional(v.string()),
    embedKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const name = args.businessName.trim();
    if (!name) {
      throw new Error("Business name is required");
    }

    const existing = await ctx.db
      .query("clients")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", identity.subject))
      .first();
    if (existing) {
      const business = await ctx.db.get(existing.businessId);
      if (!business) {
        throw new Error("Client business missing");
      }
      return {
        clientId: existing._id,
        businessId: existing.businessId,
        embedKey: business.embedKey,
        categoryCode: existing.categoryCode,
        created: false as const,
      };
    }

    await ensurePlatformCategoriesSeeded(ctx);
    const category = await categoryRowForIndustry(ctx, args.industry as IndustryKey);
    const baseKey = args.embedKey?.trim() || slugify(name);
    const embedKey = await uniqueEmbedKey(ctx, baseKey || "business");
    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const businessId = await ctx.db.insert("businesses", {
      name,
      industry: args.industry,
      categoryCode: category.code,
      embedKey,
      avatarConfig: {
        personaTone: "professional",
        defaultLanguage: "en",
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

    const clientId = await ctx.db.insert("clients", {
      categoryId: category._id,
      categoryCode: category.code,
      businessId,
      businessName: name,
      website: args.website?.trim() || undefined,
      ownerClerkUserId: identity.subject,
      contactEmail: identity.email ?? undefined,
      verification: {
        status: "pending",
        badgeLabel: verificationBadge[category.code],
      },
      subscription: { tier: "starter" },
      onboardingComplete: false,
      createdAt: now,
    });

    return {
      clientId,
      businessId,
      embedKey,
      categoryCode: category.code,
      created: true as const,
    };
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", identity.subject))
      .first();
    if (!client) return null;

    const business = await ctx.db.get(client.businessId);
    const category = await ctx.db.get(client.categoryId);
    return { client, business, category };
  },
});

export const getByBusinessId = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .unique();
    if (!client) return null;
    const category = await ctx.db.get(client.categoryId);
    return { client, category };
  },
});

/** Apply onboarding settings to an existing client workspace. */
export const finalizeOnboarding = mutation({
  args: {
    businessId: v.id("businesses"),
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

    const client = await ctx.db
      .query("clients")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .unique();

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
      avatarConfig,
      ...(args.webhookUrls !== undefined
        ? { webhookUrls: { ...business.webhookUrls, ...args.webhookUrls } }
        : {}),
    });

    if (client) {
      await ctx.db.patch(client._id, { onboardingComplete: true });
    }

    return {
      businessId: args.businessId,
      embedKey: business.embedKey,
      categoryCode: business.categoryCode ?? client?.categoryCode,
    };
  },
});

/** One-time: create clients rows for businesses that lack them. */
export const backfillFromBusinesses = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    let created = 0;

    for (const business of businesses) {
      const existing = await ctx.db
        .query("clients")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .unique();
      if (existing) continue;

      const industryKey = business.industry as IndustryKey;
      let category;
      try {
        category = await categoryRowForIndustry(ctx, industryKey);
      } catch {
        continue;
      }

      const members = await ctx.db
        .query("businessMembers")
        .filter((q) => q.eq(q.field("businessId"), business._id))
        .collect();
      const owner = members[0];

      await ctx.db.insert("clients", {
        categoryId: category._id,
        categoryCode: category.code,
        businessId: business._id,
        businessName: business.name,
        ownerClerkUserId: owner?.clerkUserId ?? "legacy-unassigned",
        verification: {
          status: "approved",
          badgeLabel: verificationBadge[category.code],
        },
        subscription: { tier: business.planTier ?? "starter" },
        onboardingComplete: true,
        createdAt: business.createdAt,
      });
      created += 1;
    }

    return { created };
  },
});
