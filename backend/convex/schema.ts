import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { businessWebhookUrls } from "./lib/webhookUrls";

const industry = v.union(
  v.literal("bank"),
  v.literal("saas"),
  v.literal("hotel"),
  v.literal("hospital"),
  v.literal("ecommerce"),
  v.literal("hr")
);

const categoryCode = v.union(
  v.literal("BANKING_FINANCIAL"),
  v.literal("SAAS_SOFTWARE"),
  v.literal("HOTELS_TOURISM"),
  v.literal("HEALTHCARE"),
  v.literal("ECOMMERCE_RETAIL"),
  v.literal("HR_RECRUITMENT")
);

const planTier = v.union(
  v.literal("starter"),
  v.literal("growth"),
  v.literal("enterprise")
);

const openAiModel = v.union(v.literal("gpt-4o-mini"), v.literal("gpt-4o"));

const businessCredits = v.object({
  intelligenceCallsRemaining: v.number(),
  intelligenceCallsLimit: v.number(),
  periodStart: v.number(),
  periodEnd: v.number(),
});

const crmData = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  accountType: v.optional(v.string()),
  churnRisk: v.optional(v.string()),
  lastPurchase: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export default defineSchema({
  categories: defineTable({
    code: categoryCode,
    industryKey: industry,
    name: v.string(),
    tag: v.string(),
    coreMetric: v.string(),
    dashboardFocus: v.string(),
    exampleClients: v.array(v.string()),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"]),

  businesses: defineTable({
    name: v.string(),
    industry,
    categoryCode: v.optional(categoryCode),
    embedKey: v.string(),
    avatarConfig: v.object({
      bpAgentId: v.optional(v.string()),
      personaTone: v.optional(v.string()),
      defaultLanguage: v.optional(v.string()),
      /** When true, pipeline does not PATCH system_prompt/greeting on the BP agent. */
      useNativeBpAgent: v.optional(v.boolean()),
    }),
    knowledgeChunks: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        embeddingId: v.optional(v.string()),
      })
    ),
    webhookUrls: businessWebhookUrls,
    planTier: v.optional(planTier),
    credits: v.optional(businessCredits),
    openAiModel: v.optional(openAiModel),
    createdAt: v.number(),
  })
    .index("by_embedKey", ["embedKey"])
    .index("by_categoryCode", ["categoryCode"]),

  usageEvents: defineTable({
    businessId: v.id("businesses"),
    type: v.union(
      v.literal("intelligence_call"),
      v.literal("post_call_analysis"),
      v.literal("connector_sync"),
      v.literal("canvas_tts_call")
    ),
    model: v.string(),
    tokensEstimate: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_business", ["businessId"]),

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
    .index("by_business", ["businessId"])
    .index("by_business_lastSeen", ["businessId", "lastSeenAt"]),

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
    invitedEmail: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_user_and_business", ["clerkUserId", "businessId"])
    .index("by_business", ["businessId"]),

  pendingInvites: defineTable({
    businessId: v.id("businesses"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer")),
    invitedByClerkUserId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked")
    ),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_business", ["businessId"])
    .index("by_email", ["email"])
    .index("by_email_status", ["email", "status"]),

  industryTemplates: defineTable({
    industry,
    categoryCode,
    personaTone: v.string(),
    defaultLanguage: v.string(),
    systemPrompt: v.string(),
    openerExamples: v.array(v.string()),
    knowledgeSections: v.array(v.string()),
    defaultTriggers: v.array(
      v.object({
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
      })
    ),
    suggestedConnectors: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_industry", ["industry"])
    .index("by_categoryCode", ["categoryCode"]),

  connectors: defineTable({
    businessId: v.id("businesses"),
    kind: v.union(
      v.literal("hubspot"),
      v.literal("stripe"),
      v.literal("cloudbeds"),
      v.literal("fhir_webhook"),
      v.literal("shopify"),
      v.literal("greenhouse"),
      v.literal("workday")
    ),
    status: v.union(
      v.literal("disconnected"),
      v.literal("connecting"),
      v.literal("connected"),
      v.literal("error")
    ),
    configJson: v.string(),
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_business_kind", ["businessId", "kind"]),

  auditLog: defineTable({
    businessId: v.id("businesses"),
    actorClerkUserId: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.string()),
    at: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_business_at", ["businessId", "at"]),

  clients: defineTable({
    categoryId: v.id("categories"),
    categoryCode: categoryCode,
    businessId: v.id("businesses"),
    businessName: v.string(),
    website: v.optional(v.string()),
    ownerClerkUserId: v.string(),
    contactEmail: v.optional(v.string()),
    verification: v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      ),
      badgeLabel: v.optional(v.string()),
    }),
    subscription: v.object({
      tier: planTier,
    }),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerClerkUserId"])
    .index("by_business", ["businessId"])
    .index("by_categoryCode", ["categoryCode"]),
});
