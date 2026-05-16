import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const DEMO_FINGERPRINT = "demo-sarangan-fp";
const SLACK_WEBHOOK_PLACEHOLDER = "https://your-n8n.app/webhook/hot-lead-slack";

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const businesses: Array<{
      name: string;
      industry: "bank" | "saas" | "hotel";
      embedKey: string;
      avatarConfig: { personaTone: string; defaultLanguage: string };
      knowledgeChunks: Array<{ id: string; text: string }>;
    }> = [
      {
        name: "Seylan Bank",
        industry: "bank" as const,
        embedKey: "seylan-demo",
        avatarConfig: { personaTone: "formal", defaultLanguage: "en" },
        knowledgeChunks: [
          { id: "gold", text: "Gold plan: priority support, 2% cashback on bills." },
          {
            id: "platinum",
            text: "Platinum plan: dedicated RM, 4% cashback, airport lounge.",
          },
        ],
      },
      {
        name: "CloudMetrics",
        industry: "saas" as const,
        embedKey: "cloudmetrics-demo",
        avatarConfig: { personaTone: "warm", defaultLanguage: "en" },
        knowledgeChunks: [
          { id: "trial", text: "14-day trial with full API access." },
        ],
      },
      {
        name: "Coral Resort",
        industry: "hotel" as const,
        embedKey: "coral-demo",
        avatarConfig: { personaTone: "warm", defaultLanguage: "en" },
        knowledgeChunks: [
          { id: "suite", text: "Ocean suite includes breakfast and spa credit." },
        ],
      },
    ];

    const businessIds: Record<string, Id<"businesses">> = {};

    for (const b of businesses) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_embedKey", (q) => q.eq("embedKey", b.embedKey))
        .unique();

      if (existing) {
        businessIds[b.embedKey] = existing._id;
        continue;
      }

      const id = await ctx.db.insert("businesses", {
        name: b.name,
        industry: b.industry,
        embedKey: b.embedKey,
        avatarConfig: b.avatarConfig,
        knowledgeChunks: b.knowledgeChunks,
        webhookUrls: {},
        createdAt: now,
      });
      businessIds[b.embedKey] = id;
    }

    const seylanId = businessIds["seylan-demo"];

    const existingVisitor = await ctx.db
      .query("visitors")
      .withIndex("by_fingerprint_and_business", (q) =>
        q.eq("fingerprint", DEMO_FINGERPRINT).eq("businessId", seylanId)
      )
      .unique();

    if (!existingVisitor) {
      const visitorId = await ctx.db.insert("visitors", {
        fingerprint: DEMO_FINGERPRINT,
        businessId: seylanId,
        pageHistory: [
          { path: "/pricing", title: "Gold vs Platinum", enteredAt: now - 3 * day },
          { path: "/pricing", title: "Gold vs Platinum", enteredAt: now - 2 * day },
          { path: "/pricing", title: "Gold vs Platinum", enteredAt: now - day },
          { path: "/pricing", title: "Gold vs Platinum", enteredAt: now },
        ],
        timeOnSite: 420000,
        returnCount: 4,
        crmId: "CRM-001",
        crmData: {
          name: "Sarangan",
          email: "sarangan@example.com",
          accountType: "prospect",
          churnRisk: "low",
          notes: "Compared Gold and Platinum plans 3 times this week",
        },
        language: "en",
        lastSeenAt: now,
        createdAt: now - 7 * day,
      });

      await ctx.db.insert("intelligence", {
        visitorId,
        businessId: seylanId,
        intentScore: 96,
        personalisedOpener:
          "Welcome back Sarangan — I see you have been comparing our Gold and Platinum plans. Shall I walk you through the key difference?",
        recommendedAction: "Offer account opening walkthrough",
        signals: ["return_visitor", "pricing_page_x3", "high_engagement"],
        computedAt: now,
      });

      await ctx.db.insert("triggers", {
        businessId: seylanId,
        condition: "intent_score_above",
        threshold: 80,
        action: "slack_alert",
        webhookUrl: SLACK_WEBHOOK_PLACEHOLDER,
        isActive: true,
      });
    }

    return {
      businesses: Object.keys(businessIds),
      demoFingerprint: DEMO_FINGERPRINT,
    };
  },
});
