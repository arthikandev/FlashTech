import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const industry = v.union(
  v.literal("bank"),
  v.literal("saas"),
  v.literal("hotel"),
  v.literal("hospital"),
  v.literal("ecommerce"),
  v.literal("hr")
);

const crmData = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  accountType: v.optional(v.string()),
  churnRisk: v.optional(v.string()),
  lastPurchase: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export default defineSchema({
  businesses: defineTable({
    name: v.string(),
    industry,
    embedKey: v.string(),
    avatarConfig: v.object({
      bpAgentId: v.optional(v.string()),
      personaTone: v.optional(v.string()),
      defaultLanguage: v.optional(v.string()),
    }),
    knowledgeChunks: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        embeddingId: v.optional(v.string()),
      })
    ),
    webhookUrls: v.object({
      n8nCrmFetch: v.optional(v.string()),
      n8nCrmPush: v.optional(v.string()),
      n8nSlack: v.optional(v.string()),
    }),
    createdAt: v.number(),
  }).index("by_embedKey", ["embedKey"]),

  visitors: defineTable({
    fingerprint: v.string(),
    businessId: v.id("businesses"),
    pageHistory: v.array(
      v.object({
        path: v.string(),
        title: v.optional(v.string()),
        enteredAt: v.number(),
        durationMs: v.optional(v.number()),
      })
    ),
    timeOnSite: v.number(),
    returnCount: v.number(),
    crmId: v.optional(v.string()),
    crmData: v.optional(crmData),
    language: v.string(),
    referrer: v.optional(v.string()),
    lastSeenAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_fingerprint_and_business", ["fingerprint", "businessId"])
    .index("by_business", ["businessId"]),

  intelligence: defineTable({
    visitorId: v.id("visitors"),
    businessId: v.id("businesses"),
    intentScore: v.number(),
    personalisedOpener: v.string(),
    recommendedAction: v.string(),
    signals: v.optional(v.array(v.string())),
    computedAt: v.number(),
  })
    .index("by_visitor", ["visitorId"])
    .index("by_business", ["businessId"]),

  conversations: defineTable({
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
    endedAt: v.number(),
  })
    .index("by_visitor", ["visitorId"])
    .index("by_business", ["businessId"]),

  triggers: defineTable({
    businessId: v.id("businesses"),
    condition: v.union(
      v.literal("intent_score_above"),
      v.literal("churn_risk_detected"),
      v.literal("appointment_booked")
    ),
    threshold: v.optional(v.number()),
    action: v.union(
      v.literal("slack_alert"),
      v.literal("crm_push"),
      v.literal("email_sequence")
    ),
    webhookUrl: v.string(),
    isActive: v.boolean(),
    lastFiredAt: v.optional(v.number()),
  }).index("by_business", ["businessId"]),

  businessMembers: defineTable({
    clerkUserId: v.string(),
    businessId: v.id("businesses"),
    role: v.union(v.literal("admin"), v.literal("viewer")),
    createdAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_user_and_business", ["clerkUserId", "businessId"]),
});
