import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  CATEGORY_SEED_ROWS,
  categoryCodeFromIndustry,
  type IndustryKey,
} from "./lib/categoriesData";

const DEMO_FINGERPRINT = "demo-sarangan-fp";
const SLACK_WEBHOOK_PLACEHOLDER = "https://your-automation.example/hooks/hot-lead-slack";

export const seedDemo = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    /** Beyond Presence agent ID for seylan-demo — from https://app.bey.chat */
    bpAgentId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, bpAgentId }) => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    for (const row of CATEGORY_SEED_ROWS) {
      const existingCat = await ctx.db
        .query("categories")
        .withIndex("by_code", (q) => q.eq("code", row.code))
        .unique();
      if (existingCat) {
        await ctx.db.patch(existingCat._id, {
          industryKey: row.industryKey,
          name: row.name,
          tag: row.tag,
          coreMetric: row.coreMetric,
          dashboardFocus: row.dashboardFocus,
          exampleClients: row.exampleClients,
          sortOrder: row.sortOrder,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("categories", {
          code: row.code,
          industryKey: row.industryKey,
          name: row.name,
          tag: row.tag,
          coreMetric: row.coreMetric,
          dashboardFocus: row.dashboardFocus,
          exampleClients: row.exampleClients,
          sortOrder: row.sortOrder,
          updatedAt: now,
        });
      }
    }

    const businesses: Array<{
      name: string;
      industry: "bank" | "saas" | "hotel";
      embedKey: string;
      avatarConfig: {
        personaTone: string;
        defaultLanguage: string;
        bpAgentId?: string;
      };
      knowledgeChunks: Array<{ id: string; text: string }>;
    }> = [
      {
        name: "Seylan Bank",
        industry: "bank" as const,
        embedKey: "seylan-demo",
        avatarConfig: {
          personaTone: "formal",
          defaultLanguage: "en",
          ...(bpAgentId ? { bpAgentId } : {}),
        },
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
        const patch: {
          avatarConfig?: typeof existing.avatarConfig;
          categoryCode?: ReturnType<typeof categoryCodeFromIndustry>;
        } = {};
        if (!existing.categoryCode) {
          patch.categoryCode = categoryCodeFromIndustry(b.industry as IndustryKey);
        }
        if (b.embedKey === "seylan-demo" && bpAgentId) {
          patch.avatarConfig = {
            ...existing.avatarConfig,
            bpAgentId,
          };
        }
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(existing._id, patch);
        }
        continue;
      }

      const id = await ctx.db.insert("businesses", {
        name: b.name,
        industry: b.industry,
        categoryCode: categoryCodeFromIndustry(b.industry as IndustryKey),
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

    let membership: { membershipId: Id<"businessMembers">; created: boolean } | null =
      null;
    if (clerkUserId) {
      const existingMember = await ctx.db
        .query("businessMembers")
        .withIndex("by_user_and_business", (q) =>
          q.eq("clerkUserId", clerkUserId).eq("businessId", seylanId)
        )
        .unique();

      if (existingMember) {
        membership = { membershipId: existingMember._id, created: false };
      } else {
        const membershipId = await ctx.db.insert("businessMembers", {
          clerkUserId,
          businessId: seylanId,
          role: "admin",
          createdAt: now,
        });
        membership = { membershipId, created: true };
      }
    }

    return {
      businesses: Object.keys(businessIds),
      demoFingerprint: DEMO_FINGERPRINT,
      membership,
    };
  },
});
