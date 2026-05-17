/**
 * Client-safe API references (paths match backend/convex).
 */
import type { FunctionReference, PaginationOptions, PaginationResult } from "convex/server";

function queryRef<Args extends Record<string, unknown>, Result>(
  name: string
): FunctionReference<"query", "public", Args, Result> {
  return name as unknown as FunctionReference<"query", "public", Args, Result>;
}

function mutationRef<Args extends Record<string, unknown>, Result>(
  name: string
): FunctionReference<"mutation", "public", Args, Result> {
  return name as unknown as FunctionReference<"mutation", "public", Args, Result>;
}

export const api = {
  intelligence: {
    listLiveSessions: queryRef<
      { businessId: string; paginationOpts: PaginationOptions },
      PaginationResult<unknown>
    >("intelligence:listLiveSessions"),
    listLiveSessionsDemo: queryRef<
      { embedKey: string; paginationOpts: PaginationOptions },
      PaginationResult<unknown>
    >("intelligence:listLiveSessionsDemo"),
    listAnalyticsSessions: queryRef<{ businessId: string }, import("./types").LiveSession[]>(
      "intelligence:listAnalyticsSessions"
    ),
    listAnalyticsSessionsDemo: queryRef<{ embedKey: string }, import("./types").LiveSession[]>(
      "intelligence:listAnalyticsSessionsDemo"
    ),
    getSessionDetail: queryRef<{ visitorId: string }, unknown>(
      "intelligence:getSessionDetail"
    ),
    getSessionDetailDemo: queryRef<{ embedKey: string; visitorId: string }, unknown>(
      "intelligence:getSessionDetailDemo"
    ),
    listByBusiness: queryRef<{ businessId: string }, unknown>(
      "intelligence:listByBusiness"
    ),
    dashboardStats: queryRef<{ businessId: string }, import("./types").DashboardStats>(
      "intelligence:dashboardStats"
    ),
    dashboardStatsDemo: queryRef<{ embedKey: string }, import("./types").DashboardStats>(
      "intelligence:dashboardStatsDemo"
    ),
  },
  conversations: {
    getByVisitor: queryRef<{ visitorId: string }, unknown>(
      "conversations:getByVisitor"
    ),
  },
  triggers: {
    listByBusiness: queryRef<{ businessId: string }, unknown>(
      "triggers:listByBusiness"
    ),
    listByBusinessDemo: queryRef<{ embedKey: string }, unknown>(
      "triggers:listByBusinessDemo"
    ),
    upsertTrigger: mutationRef<
      {
        businessId: string;
        triggerId?: string;
        condition: string;
        threshold?: number;
        action: string;
        webhookUrl: string;
        isActive: boolean;
      },
      unknown
    >("triggers:upsertTrigger"),
    deleteTrigger: mutationRef<
      { businessId: string; triggerId: string },
      unknown
    >("triggers:deleteTrigger"),
  },
  businesses: {
    getByEmbedKey: queryRef<{ embedKey: string }, unknown>(
      "businesses:getByEmbedKey"
    ),
    onboardBusiness: mutationRef<
      {
        name: string;
        industry: string;
        personaTone?: string;
        defaultLanguage?: string;
        embedKey?: string;
        bpAgentId?: string;
      },
      unknown
    >("businesses:onboardBusiness"),
    updateBusiness: mutationRef<
      {
        businessId: string;
        name?: string;
        industry?: string;
        personaTone?: string;
        defaultLanguage?: string;
        bpAgentId?: string;
        useNativeBpAgent?: boolean;
        webhookUrls?: {
          crmFetch?: string;
          crmPush?: string;
          slackHotLead?: string;
          n8nCrmFetch?: string;
          n8nCrmPush?: string;
          n8nSlack?: string;
        };
      },
      unknown
    >("businesses:updateBusiness"),
    setBpAgentForEmbedKey: mutationRef<
      { embedKey: string; bpAgentId: string; useNativeBpAgent?: boolean },
      unknown
    >("businesses:setBpAgentForEmbedKey"),
    updateKnowledgeChunks: mutationRef<
      {
        businessId: string;
        knowledgeChunks: Array<{
          id: string;
          text: string;
          embeddingId?: string;
        }>;
      },
      unknown
    >("businesses:updateKnowledgeChunks"),
  },
  businessMembers: {
    listForCurrentUser: queryRef<Record<string, never>, unknown>(
      "businessMembers:listForCurrentUser"
    ),
    linkCurrentUser: mutationRef<
      { businessId: string; role?: "admin" | "viewer" },
      unknown
    >("businessMembers:linkCurrentUser"),
  },
  usage: {
    getBalance: queryRef<{ businessId: string }, unknown>("usage:getBalance"),
    getBalanceByEmbedKey: queryRef<{ embedKey: string }, unknown>(
      "usage:getBalanceByEmbedKey"
    ),
  },
  clients: {
    createAccount: mutationRef<
      {
        businessName: string;
        industry: string;
        website?: string;
        embedKey?: string;
      },
      unknown
    >("clients:createAccount"),
    getForCurrentUser: queryRef<Record<string, never>, unknown>(
      "clients:getForCurrentUser"
    ),
    getByBusinessId: queryRef<{ businessId: string }, unknown>(
      "clients:getByBusinessId"
    ),
    finalizeOnboarding: mutationRef<
      {
        businessId: string;
        personaTone?: string;
        defaultLanguage?: string;
        bpAgentId?: string;
        useNativeBpAgent?: boolean;
        webhookUrls?: {
          crmFetch?: string;
          crmPush?: string;
          slackHotLead?: string;
          n8nCrmFetch?: string;
          n8nCrmPush?: string;
          n8nSlack?: string;
        };
      },
      unknown
    >("clients:finalizeOnboarding"),
    backfillFromBusinesses: mutationRef<Record<string, never>, unknown>(
      "clients:backfillFromBusinesses"
    ),
  },
  categories: {
    list: queryRef<Record<string, never>, unknown>("categories:list"),
    listWithClientCounts: queryRef<Record<string, never>, unknown>(
      "categories:listWithClientCounts"
    ),
    getByCode: queryRef<{ code: string }, unknown>("categories:getByCode"),
    getForEmbedKey: queryRef<{ embedKey: string }, unknown>(
      "categories:getForEmbedKey"
    ),
    listClientsByCategory: queryRef<{ code: string }, unknown>(
      "categories:listClientsByCategory"
    ),
    seedCategories: mutationRef<Record<string, never>, unknown>(
      "categories:seedCategories"
    ),
    backfillBusinessCategoryCodes: mutationRef<Record<string, never>, unknown>(
      "categories:backfillBusinessCategoryCodes"
    ),
  },
};

export const clerkEnabled = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()
);
