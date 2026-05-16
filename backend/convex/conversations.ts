import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveConversation = mutation({
  args: {
    visitorId: v.id("visitors"),
    businessId: v.id("businesses"),
    transcript: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        text: v.string(),
        timestamp: v.number(),
      })
    ),
    outcome: v.union(
      v.literal("converted"),
      v.literal("escalated"),
      v.literal("abandoned"),
      v.literal("informational")
    ),
    sentimentArc: v.array(
      v.object({
        turn: v.number(),
        score: v.number(),
      })
    ),
    actionItems: v.array(v.string()),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("conversations", {
      ...args,
      endedAt: Date.now(),
    });
    return { conversationId: id };
  },
});

export const getByVisitor = query({
  args: { visitorId: v.id("visitors") },
  handler: async (ctx, { visitorId }) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(10);
  },
});
