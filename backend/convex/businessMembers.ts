import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember, requireIdentity } from "./lib/auth";
import { appendAuditEvent } from "./audit";

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

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return await ctx.db
      .query("businessMembers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
  },
});

export const listPendingInvites = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return await ctx.db
      .query("pendingInvites")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const inviteMember = mutation({
  args: {
    businessId: v.id("businesses"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer")),
  },
  handler: async (ctx, { businessId, email, role }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("Invalid email");
    }

    const existing = await ctx.db
      .query("pendingInvites")
      .withIndex("by_email_status", (q) =>
        q.eq("email", normalized).eq("status", "pending")
      )
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role });
      return { inviteId: existing._id, created: false };
    }

    const inviteId = await ctx.db.insert("pendingInvites", {
      businessId,
      email: normalized,
      role,
      invitedByClerkUserId: identity.subject,
      status: "pending",
      createdAt: Date.now(),
    });

    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "member.invited",
      targetType: "invite",
      targetId: normalized,
      metadata: { role },
    });

    return { inviteId, created: true };
  },
});

export const revokeInvite = mutation({
  args: {
    businessId: v.id("businesses"),
    inviteId: v.id("pendingInvites"),
  },
  handler: async (ctx, { businessId, inviteId }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const invite = await ctx.db.get(inviteId);
    if (!invite || invite.businessId !== businessId) {
      throw new Error("Invite not found");
    }
    await ctx.db.patch(inviteId, { status: "revoked" });
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "member.invite_revoked",
      targetType: "invite",
      targetId: invite.email,
    });
    return { revoked: true };
  },
});

export const updateRole = mutation({
  args: {
    businessId: v.id("businesses"),
    membershipId: v.id("businessMembers"),
    role: v.union(v.literal("admin"), v.literal("viewer")),
  },
  handler: async (ctx, { businessId, membershipId, role }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const target = await ctx.db.get(membershipId);
    if (!target || target.businessId !== businessId) {
      throw new Error("Member not found");
    }

    if (target.role === "admin" && role === "viewer") {
      const allAdmins = await ctx.db
        .query("businessMembers")
        .withIndex("by_business", (q) => q.eq("businessId", businessId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();
      if (allAdmins.length <= 1) {
        throw new Error("Cannot demote the last admin");
      }
    }

    await ctx.db.patch(membershipId, { role });
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "member.role_updated",
      targetType: "member",
      targetId: target.clerkUserId,
      metadata: { role },
    });
    return { updated: true };
  },
});

export const removeMember = mutation({
  args: {
    businessId: v.id("businesses"),
    membershipId: v.id("businessMembers"),
  },
  handler: async (ctx, { businessId, membershipId }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }
    const target = await ctx.db.get(membershipId);
    if (!target || target.businessId !== businessId) {
      throw new Error("Member not found");
    }
    if (target.clerkUserId === identity.subject) {
      throw new Error("You cannot remove yourself");
    }
    if (target.role === "admin") {
      const allAdmins = await ctx.db
        .query("businessMembers")
        .withIndex("by_business", (q) => q.eq("businessId", businessId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();
      if (allAdmins.length <= 1) {
        throw new Error("Cannot remove the last admin");
      }
    }

    await ctx.db.delete(membershipId);
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "member.removed",
      targetType: "member",
      targetId: target.clerkUserId,
    });
    return { removed: true };
  },
});

export const acceptPendingInvites = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const email = identity.email?.toLowerCase().trim();
    if (!email) return { accepted: 0 };

    const invites = await ctx.db
      .query("pendingInvites")
      .withIndex("by_email_status", (q) =>
        q.eq("email", email).eq("status", "pending")
      )
      .collect();

    let accepted = 0;
    for (const invite of invites) {
      const existing = await ctx.db
        .query("businessMembers")
        .withIndex("by_user_and_business", (q) =>
          q.eq("clerkUserId", identity.subject).eq("businessId", invite.businessId)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("businessMembers", {
          clerkUserId: identity.subject,
          businessId: invite.businessId,
          role: invite.role,
          invitedEmail: email,
          createdAt: Date.now(),
        });
      }

      await ctx.db.patch(invite._id, {
        status: "accepted",
        acceptedAt: Date.now(),
      });
      accepted += 1;
    }
    return { accepted };
  },
});
