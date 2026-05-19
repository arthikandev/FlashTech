import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessMember } from "./lib/auth";

const categoryCode = v.union(
  v.literal("BANKING_FINANCIAL"),
  v.literal("SAAS_SOFTWARE"),
  v.literal("HOTELS_TOURISM"),
  v.literal("HEALTHCARE"),
  v.literal("ECOMMERCE_RETAIL"),
  v.literal("HR_RECRUITMENT")
);

type CategoryCode =
  | "BANKING_FINANCIAL"
  | "SAAS_SOFTWARE"
  | "HOTELS_TOURISM"
  | "HEALTHCARE"
  | "ECOMMERCE_RETAIL"
  | "HR_RECRUITMENT";

const INTENT_BUCKETS: Record<CategoryCode, Array<{ label: string; keywords: string[] }>> = {
  BANKING_FINANCIAL: [
    { label: "Loan eligibility & application", keywords: ["loan", "mortgage", "emi", "lending"] },
    { label: "FD / fixed deposit rates", keywords: ["fd", "fixed deposit", "interest rate"] },
    { label: "Account opening", keywords: ["open account", "current account", "savings account"] },
    { label: "Card / credit inquiries", keywords: ["card", "credit", "limit"] },
    { label: "Churn / closure intent", keywords: ["close", "cancel", "leave", "complaint"] },
  ],
  SAAS_SOFTWARE: [
    { label: "Pricing & plan comparison", keywords: ["pricing", "plan", "compare", "cost"] },
    { label: "Trial extension / upgrade", keywords: ["trial", "upgrade", "extend"] },
    { label: "Feature questions", keywords: ["feature", "support", "integrate"] },
    { label: "API / docs", keywords: ["api", "docs", "endpoint", "sdk"] },
    { label: "Churn signal", keywords: ["cancel", "downgrade", "refund"] },
  ],
  HOTELS_TOURISM: [
    { label: "Room availability & booking", keywords: ["book", "availability", "room", "reserve"] },
    { label: "Package / tour inquiries", keywords: ["package", "tour", "itinerary"] },
    { label: "Returning guest upsell", keywords: ["last stay", "again", "previous", "loyalty"] },
    { label: "Language / local services", keywords: ["language", "tamil", "sinhala", "guide"] },
    { label: "Pricing & dates", keywords: ["price", "rate", "date", "season"] },
  ],
  HEALTHCARE: [
    { label: "Appointment booking", keywords: ["appointment", "book", "consult", "schedule"] },
    { label: "Specialty / doctor search", keywords: ["doctor", "specialist", "cardio", "ortho"] },
    { label: "Multilingual intake", keywords: ["tamil", "sinhala", "language", "translate"] },
    { label: "Insurance / billing", keywords: ["insurance", "billing", "cost", "coverage"] },
    { label: "Sensitive / urgent flags", keywords: ["emergency", "urgent", "pain", "bleeding"] },
  ],
  ECOMMERCE_RETAIL: [
    { label: "Cart abandonment / recovery", keywords: ["cart", "checkout", "abandon"] },
    { label: "Product fit & sizing", keywords: ["size", "fit", "color", "stock"] },
    { label: "Delivery & returns", keywords: ["deliver", "return", "refund", "shipping"] },
    { label: "Discount / promo seeking", keywords: ["discount", "coupon", "promo", "sale"] },
    { label: "Recommendations", keywords: ["recommend", "similar", "match"] },
  ],
  HR_RECRUITMENT: [
    { label: "Open roles & fit", keywords: ["role", "position", "job", "vacancy"] },
    { label: "Application status", keywords: ["status", "applied", "screening"] },
    { label: "Interview scheduling", keywords: ["interview", "schedule", "slot"] },
    { label: "Salary / benefits", keywords: ["salary", "ctc", "benefit", "package"] },
    { label: "CV / skills feedback", keywords: ["cv", "resume", "skill", "experience"] },
  ],
};

function countMatches(transcript: string, keywords: string[]): number {
  const lower = transcript.toLowerCase();
  return keywords.reduce((sum, kw) => (lower.includes(kw) ? sum + 1 : sum), 0);
}

export const getTopIntents = query({
  args: {
    businessId: v.id("businesses"),
    code: categoryCode,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { businessId, code, limit }) => {
    await requireBusinessMember(ctx, businessId);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const buckets = INTENT_BUCKETS[code as CategoryCode] ?? [];
    const counts = buckets.map((b) => {
      let hit = 0;
      for (const c of conversations) {
        const text = c.transcript.map((t) => t.text).join(" ");
        if (countMatches(text, b.keywords) > 0) hit += 1;
      }
      return { label: b.label, count: hit };
    });

    counts.sort((a, b) => b.count - a.count);
    return counts.slice(0, limit ?? 5);
  },
});

export const getConversionFunnel = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);

    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const converted = conversations.filter((c) => c.outcome === "converted").length;
    const escalated = conversations.filter((c) => c.outcome === "escalated").length;

    return {
      visitors: visitors.length,
      conversations: conversations.length,
      escalated,
      converted,
    };
  },
});

function transcriptText(conv: { transcript: Array<{ text: string }> }): string {
  return conv.transcript.map((t) => t.text).join(" ").toLowerCase();
}

function anyMatch(text: string, kws: string[]): boolean {
  return kws.some((k) => text.includes(k));
}

export const bankingLoanFunnel = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const LOAN_KWS = ["loan", "mortgage", "emi", "lending", "borrow"];
    const ELIGIBLE_KWS = ["eligible", "qualify", "approval", "approve"];
    const APPLY_KWS = ["apply", "application", "submit", "start application"];

    let inquiries = 0;
    let eligibility = 0;
    let application = 0;
    for (const c of conversations) {
      const txt = transcriptText(c);
      if (anyMatch(txt, LOAN_KWS)) {
        inquiries += 1;
        if (anyMatch(txt, ELIGIBLE_KWS)) eligibility += 1;
        if (anyMatch(txt, APPLY_KWS) || c.outcome === "converted") application += 1;
      }
    }
    return { inquiries, eligibility, application };
  },
});

export const saasTrialCohort = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const now = Date.now();
    const DAY = 86400000;
    const buckets = [
      { label: "Day 1-2", min: 0, max: 2 * DAY, count: 0, pricing: 0 },
      { label: "Day 3-5", min: 2 * DAY, max: 5 * DAY, count: 0, pricing: 0 },
      { label: "Day 6-9", min: 5 * DAY, max: 9 * DAY, count: 0, pricing: 0 },
      { label: "Day 10+", min: 9 * DAY, max: Infinity, count: 0, pricing: 0 },
    ];

    for (const v of visitors) {
      const age = now - v.createdAt;
      const bucket = buckets.find((b) => age >= b.min && age < b.max);
      if (!bucket) continue;
      bucket.count += 1;
      const sawPricing = v.pageHistory.some((p) =>
        p.path.toLowerCase().includes("pric")
      );
      if (sawPricing) bucket.pricing += 1;
    }

    return buckets.map((b) => ({
      label: b.label,
      visitors: b.count,
      pricingViews: b.pricing,
    }));
  },
});

export const hotelsReturningGuests = query({
  args: { businessId: v.id("businesses"), limit: v.optional(v.number()) },
  handler: async (ctx, { businessId, limit }) => {
    await requireBusinessMember(ctx, businessId);
    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const returning = visitors
      .filter((v) => v.returnCount > 1)
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
      .slice(0, limit ?? 10);

    return returning.map((v) => ({
      visitorId: v._id,
      name: v.crmData?.name ?? "Guest",
      returnCount: v.returnCount,
      lastSeenAt: v.lastSeenAt,
      language: v.language,
      lastPurchase: v.crmData?.lastPurchase,
      notes: v.crmData?.notes,
    }));
  },
});

export const healthcareIntakeMatrix = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const SPECIALTIES = [
      { label: "Cardiology", kws: ["cardio", "heart", "chest pain"] },
      { label: "Pediatrics", kws: ["pediatric", "child", "kid"] },
      { label: "Orthopedics", kws: ["ortho", "bone", "joint", "fracture"] },
      { label: "General", kws: ["consult", "checkup", "general"] },
    ];

    const convByVisitor = new Map<string, typeof conversations>();
    for (const c of conversations) {
      const arr = convByVisitor.get(c.visitorId as unknown as string) ?? [];
      arr.push(c);
      convByVisitor.set(c.visitorId as unknown as string, arr);
    }

    const matrix: Array<{ language: string; specialty: string; count: number }> = [];
    const langs = Array.from(new Set(visitors.map((v) => v.language || "en")));
    for (const lang of langs) {
      for (const sp of SPECIALTIES) {
        let count = 0;
        for (const v of visitors) {
          if ((v.language || "en") !== lang) continue;
          const convs = convByVisitor.get(v._id as unknown as string) ?? [];
          const txt = convs.map(transcriptText).join(" ");
          if (anyMatch(txt, sp.kws)) count += 1;
        }
        if (count > 0) {
          matrix.push({ language: lang, specialty: sp.label, count });
        }
      }
    }
    return matrix;
  },
});

export const ecommerceCartStream = query({
  args: { businessId: v.id("businesses"), limit: v.optional(v.number()) },
  handler: async (ctx, { businessId, limit }) => {
    await requireBusinessMember(ctx, businessId);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(100);

    const CART_KWS = ["cart", "checkout", "abandon", "buy now"];
    const stream = conversations
      .filter((c) => anyMatch(transcriptText(c), CART_KWS))
      .slice(0, limit ?? 12)
      .map((c) => ({
        conversationId: c._id,
        visitorId: c.visitorId,
        outcome: c.outcome,
        endedAt: c.endedAt,
        snippet: c.transcript
          .map((t) => t.text)
          .join(" ")
          .slice(0, 140),
      }));

    return stream;
  },
});

export const hrPipelineByStage = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessMember(ctx, businessId);
    const intel = await ctx.db
      .query("intelligence")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .collect();

    const stages = [
      { label: "Applied", min: 0, max: 30, ids: [] as string[] },
      { label: "Screened", min: 30, max: 60, ids: [] as string[] },
      { label: "Interview", min: 60, max: 85, ids: [] as string[] },
      { label: "Offer", min: 85, max: 101, ids: [] as string[] },
    ];

    for (const row of intel) {
      const stage = stages.find(
        (s) => row.intentScore >= s.min && row.intentScore < s.max
      );
      if (stage) stage.ids.push(row.visitorId as unknown as string);
    }

    return stages.map((s) => ({ label: s.label, count: s.ids.length }));
  },
});

export const getRecentSignals = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { businessId, limit }) => {
    await requireBusinessMember(ctx, businessId);

    const intel = await ctx.db
      .query("intelligence")
      .withIndex("by_business", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(limit ?? 20);

    return intel.map((row) => ({
      visitorId: row.visitorId,
      intentScore: row.intentScore,
      recommendedAction: row.recommendedAction,
      signals: row.signals ?? [],
      computedAt: row.computedAt,
    }));
  },
});
