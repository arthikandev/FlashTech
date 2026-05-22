import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";
import { appendAuditEvent } from "./audit";

const connectorKind = v.union(
  v.literal("hubspot"),
  v.literal("stripe"),
  v.literal("cloudbeds"),
  v.literal("fhir_webhook"),
  v.literal("shopify"),
  v.literal("greenhouse"),
  v.literal("workday")
);

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    return await ctx.db
      .query("connectors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
  },
});

export const upsertConnector = mutation({
  args: {
    businessId: v.id("businesses"),
    kind: connectorKind,
    configJson: v.string(),
  },
  handler: async (ctx, { businessId, kind, configJson }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const existing = await ctx.db
      .query("connectors")
      .withIndex("by_business_kind", (q) =>
        q.eq("businessId", businessId).eq("kind", kind)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        configJson,
        status: "connected",
        lastError: undefined,
      });
      await appendAuditEvent(ctx, {
        businessId,
        actorClerkUserId: identity.subject,
        action: "connector.updated",
        targetType: "connector",
        targetId: kind,
      });
      return { connectorId: existing._id, created: false };
    }

    const connectorId = await ctx.db.insert("connectors", {
      businessId,
      kind,
      status: "connected",
      configJson,
      createdAt: Date.now(),
    });
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "connector.connected",
      targetType: "connector",
      targetId: kind,
    });
    return { connectorId, created: true };
  },
});

export const disconnect = mutation({
  args: {
    businessId: v.id("businesses"),
    kind: connectorKind,
  },
  handler: async (ctx, { businessId, kind }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const existing = await ctx.db
      .query("connectors")
      .withIndex("by_business_kind", (q) =>
        q.eq("businessId", businessId).eq("kind", kind)
      )
      .unique();
    if (!existing) return { disconnected: false };

    await ctx.db.patch(existing._id, { status: "disconnected" });
    await appendAuditEvent(ctx, {
      businessId,
      actorClerkUserId: identity.subject,
      action: "connector.disconnected",
      targetType: "connector",
      targetId: kind,
    });
    return { disconnected: true };
  },
});

export const markSynced = mutation({
  args: {
    businessId: v.id("businesses"),
    kind: connectorKind,
    error: v.optional(v.string()),
  },
  handler: async (ctx, { businessId, kind, error }) => {
    const { membership } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const existing = await ctx.db
      .query("connectors")
      .withIndex("by_business_kind", (q) =>
        q.eq("businessId", businessId).eq("kind", kind)
      )
      .unique();
    if (!existing) throw new Error("Connector not found");

    await ctx.db.patch(existing._id, {
      lastSyncAt: Date.now(),
      status: error ? "error" : "connected",
      lastError: error,
    });

    await ctx.db.insert("usageEvents", {
      businessId,
      type: "connector_sync",
      model: kind,
      createdAt: Date.now(),
    });

    return { synced: true };
  },
});
