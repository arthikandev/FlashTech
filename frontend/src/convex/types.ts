import type { Id } from "./ids";

export type CrmData = {
  name?: string;
  email?: string;
  accountType?: string;
  churnRisk?: string;
  lastPurchase?: string;
  notes?: string;
};

export type CategoryCode =
  | "BANKING_FINANCIAL"
  | "SAAS_SOFTWARE"
  | "HOTELS_TOURISM"
  | "HEALTHCARE"
  | "ECOMMERCE_RETAIL"
  | "HR_RECRUITMENT";

export type CategoryRecord = {
  _id: string;
  code: CategoryCode;
  industryKey: string;
  name: string;
  tag: string;
  coreMetric: string;
  dashboardFocus: string;
  exampleClients: string[];
  sortOrder: number;
  updatedAt: number;
};

export type CategoryWithClients = CategoryRecord & {
  clientCount: number;
  clients: Array<{ _id: string; name: string; embedKey: string }>;
};

export type Business = {
  _id: Id<"businesses">;
  name: string;
  embedKey: string;
  industry?: string;
  categoryCode?: CategoryCode;
  avatarConfig?: {
    bpAgentId?: string;
    personaTone?: string;
    defaultLanguage?: string;
    useNativeBpAgent?: boolean;
  };
  webhookUrls?: {
    crmFetch?: string;
    crmPush?: string;
    slackHotLead?: string;
    n8nCrmFetch?: string;
    n8nCrmPush?: string;
    n8nSlack?: string;
  };
};

export type DashboardStats = {
  liveVisitors: number;
  conversations: number;
  hotLeadRate: number | null;
  avgIntent: number | null;
  conversionRate: number | null;
};

export type LiveSession = {
  visitorId: Id<"visitors">;
  fingerprint: string;
  name?: string;
  intentScore?: number;
  personalisedOpener?: string;
  recommendedAction?: string;
  signals?: string[];
  returnCount: number;
  lastSeenAt: number;
  language?: string;
  pageTrail?: string;
  crmAccountType?: string;
  crmChurnRisk?: string;
  hasConversation?: boolean;
  conversationOutcome?: string;
  conversationDuration?: number;
};

export type SessionDetailResult = {
  visitor: {
    _id: Id<"visitors">;
    fingerprint: string;
    returnCount: number;
    crmId?: string;
    crmData?: CrmData;
    language?: string;
    timeOnSite?: number;
  };
  business?: Business | null;
  intelligence: {
    intentScore?: number;
    personalisedOpener?: string;
    recommendedAction?: string;
    signals?: string[];
    computedAt?: number;
  } | null;
  conversation: {
    outcome?: string;
    actionItems?: string[];
    duration?: number;
    endedAt?: number;
    sentimentArc?: Array<{ turn: number; score: number }>;
    transcript?: Array<{ role: string; text: string; timestamp?: number }>;
  } | null;
};
