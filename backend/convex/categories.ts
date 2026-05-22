import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  categoryCodeFromIndustry,
  type IndustryKey,
} from "./lib/categoriesData";
import { ensurePlatformCategoriesSeeded } from "./lib/ensureCategoriesSeeded";

const categoryCode = v.union(
  v.literal("BANKING_FINANCIAL"),
  v.literal("SAAS_SOFTWARE"),
  v.literal("HOTELS_TOURISM"),
  v.literal("HEALTHCARE"),
  v.literal("ECOMMERCE_RETAIL"),
  v.literal("HR_RECRUITMENT")
);

/** Idempotent seed for the six fixed platform categories. */
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const { inserted, updated } = await ensurePlatformCategoriesSeeded(ctx);
    return { inserted, updated, total: 6 };
  },
});

/** Backfill categoryCode on businesses that only have industry set. */
export const backfillBusinessCategoryCodes = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    let patched = 0;

    for (const business of businesses) {
      if (business.categoryCode) continue;
      const code = categoryCodeFromIndustry(business.industry as IndustryKey);
      await ctx.db.patch(business._id, { categoryCode: code });
      patched += 1;
    }

    return { patched, total: businesses.length };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("categories").collect();
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getByCode = query({
  args: { code: categoryCode },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
  },
});

export type CategoryClientRow = {
  _id: string;
  name: string;
  embedKey: string;
  industry: string;
  categoryCode?: string;
  createdAt: number;
};

export const listClientsByCategory = query({
  args: { code: categoryCode },
  handler: async (ctx, { code }) => {
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_categoryCode", (q) => q.eq("categoryCode", code))
      .collect();

    return businesses
      .map((b) => ({
        _id: b._id,
        name: b.name,
        embedKey: b.embedKey,
        industry: b.industry,
        categoryCode: b.categoryCode,
        createdAt: b.createdAt,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

/** Categories with live client counts from the database. */
export const getForEmbedKey = query({
  args: { embedKey: v.string() },
  handler: async (ctx, { embedKey }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();

    if (!business) return null;

    const code =
      business.categoryCode ??
      categoryCodeFromIndustry(business.industry as IndustryKey);

    const category = await ctx.db
      .query("categories")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    return category
      ? { category, business: { _id: business._id, name: business.name, embedKey: business.embedKey } }
      : null;
  },
});

export const listWithClientCounts = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const sorted = categories.sort((a, b) => a.sortOrder - b.sortOrder);

    const result = await Promise.all(
      sorted.map(async (cat) => {
        const clients = await ctx.db
          .query("businesses")
          .withIndex("by_categoryCode", (q) => q.eq("categoryCode", cat.code))
          .collect();

        return {
          ...cat,
          clientCount: clients.length,
          clients: clients.map((b) => ({
            _id: b._id,
            name: b.name,
            embedKey: b.embedKey,
          })),
        };
      })
    );

    return result;
  },
});
