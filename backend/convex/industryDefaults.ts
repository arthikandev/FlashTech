import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";

const INDUSTRY_TO_CODE = {
  bank: "BANKING_FINANCIAL",
  saas: "SAAS_SOFTWARE",
  hotel: "HOTELS_TOURISM",
  hospital: "HEALTHCARE",
  ecommerce: "ECOMMERCE_RETAIL",
  hr: "HR_RECRUITMENT",
} as const;

type IndustryKey = keyof typeof INDUSTRY_TO_CODE;

type TemplateSpec = {
  personaTone: string;
  defaultLanguage: string;
  systemPrompt: string;
  openerExamples: string[];
  knowledgeSections: string[];
  defaultTriggers: Array<{
    condition: "intent_score_above" | "churn_risk_detected" | "appointment_booked";
    threshold?: number;
    action: "slack_alert" | "crm_push" | "email_sequence";
  }>;
  suggestedConnectors: string[];
};

const TEMPLATES: Record<IndustryKey, TemplateSpec> = {
  bank: {
    personaTone: "trusted advisor — formal, bilingual SI/EN, confidence-building",
    defaultLanguage: "en",
    systemPrompt:
      "You are a trusted banking concierge. Greet returning customers by name when known, surface relevant loan, FD, or account openings based on the visitor's page history, and never promise final rates — defer to the relationship manager.",
    openerExamples: [
      "Welcome back. I see you were comparing FD rates last week — would you like the latest 1-year rate?",
      "Looking at home loans? I can pre-check eligibility before you speak with our officer.",
    ],
    knowledgeSections: [
      "Loan products & eligibility criteria",
      "FD / deposit rates by tenor",
      "Account types and minimum balance",
      "Branch & ATM locator",
      "Card products & rewards",
    ],
    defaultTriggers: [
      { condition: "intent_score_above", threshold: 80, action: "crm_push" },
      { condition: "churn_risk_detected", action: "slack_alert" },
    ],
    suggestedConnectors: ["hubspot"],
  },
  saas: {
    personaTone: "helpful product manager — casual, technically literate, value-led",
    defaultLanguage: "en",
    systemPrompt:
      "You are a SaaS product specialist. Detect trial-day cohort and recommend the next-best action (start a workspace, schedule onboarding, see pricing). Never invent feature names — defer to docs.",
    openerExamples: [
      "Trial day 6 — most teams export their first report by now. Want me to walk you through it?",
      "Heading to pricing — should I compare Growth vs Enterprise for your team size?",
    ],
    knowledgeSections: [
      "Pricing tiers & limits",
      "Feature matrix",
      "Integrations & API",
      "Onboarding checklist",
      "Security & compliance",
    ],
    defaultTriggers: [
      { condition: "intent_score_above", threshold: 70, action: "email_sequence" },
      { condition: "churn_risk_detected", action: "slack_alert" },
    ],
    suggestedConnectors: ["stripe", "hubspot"],
  },
  hotel: {
    personaTone: "warm concierge — multilingual, attentive, upsell-aware",
    defaultLanguage: "en",
    systemPrompt:
      "You are a hotel concierge. Greet returning guests with their last-stay preferences when known, suggest packages that match their browsing, and confirm dates and party size before quoting.",
    openerExamples: [
      "Welcome back to The Reef. Same sea-view suite as last March, or shall I show our new villa?",
      "Looking at our New Year package — would you like rates for two adults or family?",
    ],
    knowledgeSections: [
      "Room types & amenities",
      "Packages & seasonal offers",
      "Local experiences & tours",
      "Booking & cancellation policy",
      "Loyalty programme",
    ],
    defaultTriggers: [
      { condition: "appointment_booked", action: "crm_push" },
      { condition: "intent_score_above", threshold: 75, action: "slack_alert" },
    ],
    suggestedConnectors: ["cloudbeds", "hubspot"],
  },
  hospital: {
    personaTone: "empathetic intake nurse — calm, multilingual TA/SI/EN, never diagnostic",
    defaultLanguage: "en",
    systemPrompt:
      "You are a hospital intake assistant. Capture appointment type, preferred language, and any urgency flags. Never give medical advice. Escalate immediately if the visitor mentions emergency keywords.",
    openerExamples: [
      "Welcome. Are you booking for yourself or a family member? I can route you to the right specialist.",
      "I see you visited cardiology last time — would you like to follow up with Dr. Perera?",
    ],
    knowledgeSections: [
      "Specialties & doctors",
      "Appointment booking process",
      "Insurance & billing",
      "Emergency escalation paths",
      "Languages supported",
    ],
    defaultTriggers: [
      { condition: "appointment_booked", action: "slack_alert" },
      { condition: "intent_score_above", threshold: 85, action: "crm_push" },
    ],
    suggestedConnectors: ["fhir_webhook"],
  },
  ecommerce: {
    personaTone: "friendly stylist — urgency-aware, helpful, never pushy",
    defaultLanguage: "en",
    systemPrompt:
      "You are an e-commerce assistant. When a visitor returns with items in cart, acknowledge them and offer one targeted nudge (sizing help, discount eligibility, delivery ETA).",
    openerExamples: [
      "Still thinking about the navy linen shirt? It's down to two in your size — want me to hold it?",
      "Your cart from yesterday is saved. Free shipping kicks in at one more item.",
    ],
    knowledgeSections: [
      "Product catalogue & fit guides",
      "Promo & coupon stack rules",
      "Shipping & returns policy",
      "Recommendation logic",
      "Loyalty / rewards",
    ],
    defaultTriggers: [
      { condition: "churn_risk_detected", action: "email_sequence" },
      { condition: "intent_score_above", threshold: 70, action: "crm_push" },
    ],
    suggestedConnectors: ["shopify"],
  },
  hr: {
    personaTone: "professional recruiter — neutral, candidate-respectful, clear",
    defaultLanguage: "en",
    systemPrompt:
      "You are a recruitment assistant. Greet candidates by name when known, surface roles that match their CV, and explain next steps. Never make hiring decisions on the call.",
    openerExamples: [
      "Welcome back. We've shortlisted two roles that match your backend experience — interested?",
      "I see you opened the senior engineer JD — would you like a 15-minute screen this week?",
    ],
    knowledgeSections: [
      "Open roles & JDs",
      "Interview process & timeline",
      "Compensation bands",
      "Benefits & relocation",
      "Company culture",
    ],
    defaultTriggers: [
      { condition: "intent_score_above", threshold: 75, action: "crm_push" },
      { condition: "appointment_booked", action: "slack_alert" },
    ],
    suggestedConnectors: ["greenhouse", "workday"],
  },
};

export const seedIndustryTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existing = await ctx.db.query("industryTemplates").collect();
    const byIndustry = new Map(existing.map((t) => [t.industry, t]));

    let created = 0;
    let updated = 0;

    for (const [industry, spec] of Object.entries(TEMPLATES) as Array<
      [IndustryKey, TemplateSpec]
    >) {
      const code = INDUSTRY_TO_CODE[industry];
      const existingRow = byIndustry.get(industry);
      const payload = {
        industry,
        categoryCode: code,
        personaTone: spec.personaTone,
        defaultLanguage: spec.defaultLanguage,
        systemPrompt: spec.systemPrompt,
        openerExamples: spec.openerExamples,
        knowledgeSections: spec.knowledgeSections,
        defaultTriggers: spec.defaultTriggers,
        suggestedConnectors: spec.suggestedConnectors,
        updatedAt: now,
      } as const;

      if (existingRow) {
        await ctx.db.patch(existingRow._id, payload);
        updated += 1;
      } else {
        await ctx.db.insert("industryTemplates", payload);
        created += 1;
      }
    }

    return { created, updated };
  },
});

export const getTemplateForBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const business = await ctx.db.get(businessId);
    if (!business) return null;

    const template = await ctx.db
      .query("industryTemplates")
      .withIndex("by_industry", (q) => q.eq("industry", business.industry))
      .unique();

    return template ?? null;
  },
});

export const applyIndustryDefaults = mutation({
  args: {
    businessId: v.id("businesses"),
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, { businessId, overwrite }) => {
    const { membership, identity } = await requireBusinessMember(ctx, businessId);
    if (membership.role !== "admin") {
      throw new Error("Forbidden: admin role required");
    }

    const business = await ctx.db.get(businessId);
    if (!business) throw new Error("Business not found");

    const template = await ctx.db
      .query("industryTemplates")
      .withIndex("by_industry", (q) => q.eq("industry", business.industry))
      .unique();

    if (!template) {
      throw new Error(
        `No industryTemplates row for industry "${business.industry}". Run seedIndustryTemplates first.`
      );
    }

    const avatarConfig = business.avatarConfig ?? {};
    const shouldOverwritePersona =
      overwrite === true || !avatarConfig.personaTone;
    const shouldOverwriteLang =
      overwrite === true || !avatarConfig.defaultLanguage;

    await ctx.db.patch(businessId, {
      avatarConfig: {
        ...avatarConfig,
        personaTone: shouldOverwritePersona
          ? template.personaTone
          : avatarConfig.personaTone,
        defaultLanguage: shouldOverwriteLang
          ? template.defaultLanguage
          : avatarConfig.defaultLanguage,
      },
    });

    const existingTriggers = await ctx.db
      .query("triggers")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    let triggersCreated = 0;
    if (existingTriggers.length === 0 || overwrite === true) {
      for (const dt of template.defaultTriggers) {
        await ctx.db.insert("triggers", {
          businessId,
          condition: dt.condition,
          threshold: dt.threshold,
          action: dt.action,
          webhookUrl: business.webhookUrls?.slackHotLead ?? "",
          isActive: false,
        });
        triggersCreated += 1;
      }
    }

    await ctx.db.insert("auditLog", {
      businessId,
      actorClerkUserId: identity.subject,
      action: "industry_defaults.applied",
      targetType: "business",
      targetId: businessId,
      metadata: JSON.stringify({ industry: business.industry, triggersCreated }),
      at: Date.now(),
    });

    return {
      industry: business.industry,
      personaApplied: shouldOverwritePersona,
      triggersCreated,
    };
  },
});
