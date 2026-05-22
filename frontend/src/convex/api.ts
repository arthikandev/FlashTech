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
    listAnalyticsSessions: queryRef<{ businessId: string }, import("./types").LiveSession[]>(
      "intelligence:listAnalyticsSessions"
    ),
    getSessionDetail: queryRef<{ visitorId: string }, unknown>(
      "intelligence:getSessionDetail"
    ),
    listByBusiness: queryRef<{ businessId: string }, unknown>(
      "intelligence:listByBusiness"
    ),
    dashboardStats: queryRef<{ businessId: string }, import("./types").DashboardStats>(
      "intelligence:dashboardStats"
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
    listByBusiness: queryRef<
      { businessId: string },
      Array<{
        _id: string;
        clerkUserId: string;
        businessId: string;
        role: "admin" | "viewer";
        invitedEmail?: string;
        createdAt: number;
      }>
    >("businessMembers:listByBusiness"),
    listPendingInvites: queryRef<
      { businessId: string },
      Array<{
        _id: string;
        businessId: string;
        email: string;
        role: "admin" | "viewer";
        invitedByClerkUserId: string;
        status: string;
        createdAt: number;
      }>
    >("businessMembers:listPendingInvites"),
    inviteMember: mutationRef<
      { businessId: string; email: string; role: "admin" | "viewer" },
      { inviteId: string; created: boolean }
    >("businessMembers:inviteMember"),
    revokeInvite: mutationRef<
      { businessId: string; inviteId: string },
      { revoked: boolean }
    >("businessMembers:revokeInvite"),
    updateRole: mutationRef<
      {
        businessId: string;
        membershipId: string;
        role: "admin" | "viewer";
      },
      { updated: boolean }
    >("businessMembers:updateRole"),
    removeMember: mutationRef<
      { businessId: string; membershipId: string },
      { removed: boolean }
    >("businessMembers:removeMember"),
    acceptPendingInvites: mutationRef<
      Record<string, never>,
      { accepted: number }
    >("businessMembers:acceptPendingInvites"),
  },
  usage: {
    getBalance: queryRef<{ businessId: string }, unknown>("usage:getBalance"),
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
  categoryStats: {
    getTopIntents: queryRef<
      { businessId: string; code: string; limit?: number },
      Array<{ label: string; count: number }>
    >("categoryStats:getTopIntents"),
    getConversionFunnel: queryRef<
      { businessId: string },
      { visitors: number; conversations: number; escalated: number; converted: number }
    >("categoryStats:getConversionFunnel"),
    getRecentSignals: queryRef<
      { businessId: string; limit?: number },
      Array<{
        visitorId: string;
        intentScore: number;
        recommendedAction: string;
        signals: string[];
        computedAt: number;
      }>
    >("categoryStats:getRecentSignals"),
    bankingLoanFunnel: queryRef<
      { businessId: string },
      { inquiries: number; eligibility: number; application: number }
    >("categoryStats:bankingLoanFunnel"),
    saasTrialCohort: queryRef<
      { businessId: string },
      Array<{ label: string; visitors: number; pricingViews: number }>
    >("categoryStats:saasTrialCohort"),
    hotelsReturningGuests: queryRef<
      { businessId: string; limit?: number },
      Array<{
        visitorId: string;
        name: string;
        returnCount: number;
        lastSeenAt: number;
        language: string;
        lastPurchase?: string;
        notes?: string;
      }>
    >("categoryStats:hotelsReturningGuests"),
    healthcareIntakeMatrix: queryRef<
      { businessId: string },
      Array<{ language: string; specialty: string; count: number }>
    >("categoryStats:healthcareIntakeMatrix"),
    ecommerceCartStream: queryRef<
      { businessId: string; limit?: number },
      Array<{
        conversationId: string;
        visitorId: string;
        outcome: string;
        endedAt: number;
        snippet: string;
      }>
    >("categoryStats:ecommerceCartStream"),
    hrPipelineByStage: queryRef<
      { businessId: string },
      Array<{ label: string; count: number }>
    >("categoryStats:hrPipelineByStage"),
  },
  connectors: {
    listByBusiness: queryRef<
      { businessId: string },
      Array<{
        _id: string;
        kind: string;
        status: "disconnected" | "connecting" | "connected" | "error";
        configJson: string;
        lastSyncAt?: number;
        lastError?: string;
      }>
    >("connectors:listByBusiness"),
    upsertConnector: mutationRef<
      { businessId: string; kind: string; configJson: string },
      { connectorId: string; created: boolean }
    >("connectors:upsertConnector"),
    disconnect: mutationRef<
      { businessId: string; kind: string },
      { disconnected: boolean }
    >("connectors:disconnect"),
    markSynced: mutationRef<
      { businessId: string; kind: string; error?: string },
      { synced: boolean }
    >("connectors:markSynced"),
  },
  industryDefaults: {
    seedIndustryTemplates: mutationRef<Record<string, never>, { created: number; updated: number }>(
      "industryDefaults:seedIndustryTemplates"
    ),
    getTemplateForBusiness: queryRef<
      { businessId: string },
      {
        industry: string;
        categoryCode: string;
        personaTone: string;
        defaultLanguage: string;
        systemPrompt: string;
        openerExamples: string[];
        knowledgeSections: string[];
        suggestedConnectors: string[];
      } | null
    >("industryDefaults:getTemplateForBusiness"),
    applyIndustryDefaults: mutationRef<
      { businessId: string; overwrite?: boolean },
      { industry: string; personaApplied: boolean; triggersCreated: number }
    >("industryDefaults:applyIndustryDefaults"),
  },
  embed: {
    rotateEmbedKey: mutationRef<
      { businessId: string },
      { previous: string; next: string }
    >("embed:rotateEmbedKey"),
    updateAvatarConfig: mutationRef<
      {
        businessId: string;
        personaTone?: string;
        defaultLanguage?: string;
        bpAgentId?: string;
        useNativeBpAgent?: boolean;
      },
      { ok: boolean }
    >("embed:updateAvatarConfig"),
  },
  billing: {
    getPlanCatalog: queryRef<
      Record<string, never>,
      Array<{ tier: string; intelligenceCallsLimit: number; monthlyUsd: number }>
    >("billing:getPlanCatalog"),
    getBillingState: queryRef<
      { businessId: string },
      {
        planTier: "starter" | "growth" | "enterprise";
        credits: {
          intelligenceCallsRemaining: number;
          intelligenceCallsLimit: number;
          periodStart: number;
          periodEnd: number;
        };
        usageThisPeriod: {
          intelligenceCalls: number;
          postCallAnalyses: number;
          connectorSyncs: number;
          totalEvents: number;
        };
      } | null
    >("billing:getBillingState"),
    setPlan: mutationRef<
      { businessId: string; planTier: "starter" | "growth" | "enterprise" },
      { planTier: string; intelligenceCallsLimit: number }
    >("billing:setPlan"),
  },
  audit: {
    listForBusiness: queryRef<
      { businessId: string; limit?: number },
      Array<{
        _id: string;
        actorClerkUserId: string;
        action: string;
        targetType: string;
        targetId?: string;
        metadata?: string;
        at: number;
      }>
    >("audit:listForBusiness"),
    recordEvent: mutationRef<
      {
        businessId: string;
        action: string;
        targetType: string;
        targetId?: string;
        metadataJson?: string;
      },
      { recorded: boolean }
    >("audit:recordEvent"),
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
