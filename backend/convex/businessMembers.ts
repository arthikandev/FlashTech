import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const memberships = await ctx.db
      .query("businessMembers")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .collect();

    return Promise.all(
      memberships.map(async (membership) => {
        const business = await ctx.db.get(membership.businessId);
        return {
          membership,
          business,
        };
      })
    );
  },
});

export const linkCurrentUser = mutation({
  args: {
    businessId: v.id("businesses"),
    role: v.optional(v.union(v.literal("admin"), v.literal("viewer"))),
  },
  handler: async (ctx, { businessId, role }) => {
    const identity = await requireIdentity(ctx);
    const business = await ctx.db.get(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const existing = await ctx.db
      .query("businessMembers")
      .withIndex("by_user_and_business", (q) =>
        q.eq("clerkUserId", identity.subject).eq("businessId", businessId)
      )
      .unique();

    if (existing) {
      return { membershipId: existing._id, created: false };
    }

    const membershipId = await ctx.db.insert("businessMembers", {
      clerkUserId: identity.subject,
      businessId,
      role: role ?? "admin",
      createdAt: Date.now(),
    });

    return { membershipId, created: true };
  },
});

export const seedDemoMember = internalMutation({
  args: {
    clerkUserId: v.string(),
    embedKey: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("viewer"))),
  },
  handler: async (ctx, { clerkUserId, embedKey, role }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_embedKey", (q) => q.eq("embedKey", embedKey))
      .unique();

    if (!business) {
      throw new Error(`Unknown embedKey: ${embedKey}`);
    }

    const existing = await ctx.db
      .query("businessMembers")
      .withIndex("by_user_and_business", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("businessId", business._id)
      )
      .unique();

    if (existing) {
      return { membershipId: existing._id, created: false };
    }

    const membershipId = await ctx.db.insert("businessMembers", {
      clerkUserId,
      businessId: business._id,
      role: role ?? "admin",
      createdAt: Date.now(),
    });

    return { membershipId, created: true };
  },
});
