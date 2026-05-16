import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
  },
  handler: async (ctx, args) => {
    const baseKey = args.embedKey?.trim() || slugify(args.name);
    const embedKey = await uniqueEmbedKey(ctx, baseKey || "business");

    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      industry: args.industry,
      embedKey,
      avatarConfig: {
        personaTone: args.personaTone ?? "professional",
        defaultLanguage: args.defaultLanguage ?? "en",
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
