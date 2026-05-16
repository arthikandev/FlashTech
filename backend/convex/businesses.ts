import { query } from "./_generated/server";
import { v } from "convex/values";

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
