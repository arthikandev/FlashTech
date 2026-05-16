/* eslint-disable */
import type { GenericId } from "convex/values";

export type TableNames =
  | "businesses"
  | "visitors"
  | "intelligence"
  | "conversations"
  | "triggers";

export type Id<TableName extends TableNames> = GenericId<TableName>;

export type DataModel = {
  businesses: {
    _id: Id<"businesses">;
    _creationTime: number;
    name: string;
    industry: "bank" | "saas" | "hotel" | "hospital" | "ecommerce" | "hr";
    embedKey: string;
    avatarConfig: {
      bpAgentId?: string;
      personaTone?: string;
      defaultLanguage?: string;
    };
    knowledgeChunks: Array<{ id: string; text: string; embeddingId?: string }>;
    webhookUrls: {
      n8nCrmFetch?: string;
      n8nCrmPush?: string;
      n8nSlack?: string;
    };
    createdAt: number;
  };
  visitors: {
    _id: Id<"visitors">;
    _creationTime: number;
    fingerprint: string;
    businessId: Id<"businesses">;
    pageHistory: Array<{
      path: string;
      title?: string;
      enteredAt: number;
      durationMs?: number;
    }>;
    timeOnSite: number;
    returnCount: number;
    crmId?: string;
    crmData?: {
      name?: string;
      email?: string;
      accountType?: string;
      churnRisk?: string;
      lastPurchase?: string;
      notes?: string;
    };
    language: string;
    lastSeenAt: number;
    createdAt: number;
  };
  intelligence: {
    _id: Id<"intelligence">;
    _creationTime: number;
    visitorId: Id<"visitors">;
    businessId: Id<"businesses">;
    intentScore: number;
    personalisedOpener: string;
    recommendedAction: string;
    signals?: string[];
    computedAt: number;
  };
  conversations: {
    _id: Id<"conversations">;
    _creationTime: number;
    visitorId: Id<"visitors">;
    businessId: Id<"businesses">;
    transcript: Array<{
      role: "user" | "assistant";
      text: string;
      timestamp: number;
    }>;
    outcome: "converted" | "escalated" | "abandoned" | "informational";
    sentimentArc: Array<{ turn: number; score: number }>;
    actionItems: string[];
    duration: number;
    endedAt: number;
  };
  triggers: {
    _id: Id<"triggers">;
    _creationTime: number;
    businessId: Id<"businesses">;
    condition: "intent_score_above" | "churn_risk_detected" | "appointment_booked";
    threshold?: number;
    action: "slack_alert" | "crm_push" | "email_sequence";
    webhookUrl: string;
    isActive: boolean;
    lastFiredAt?: number;
  };
};
