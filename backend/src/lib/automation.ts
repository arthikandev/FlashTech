import type { Id } from "../../convex/_generated/dataModel";
import type { IntelligenceResult } from "./types";
import {
  fireChurnWebhook,
  fireSlackWebhook,
  fireTriggerWebhook,
  forwardCrmPush,
} from "./pipeline";

const HOT_LEAD_THRESHOLD = 80;

type VisitorSnapshot = {
  _id: Id<"visitors">;
  crmData?: {
    name?: string;
    email?: string;
    churnRisk?: string;
  } | null;
  crmId?: string;
  fingerprint?: string;
};

type BusinessSnapshot = {
  _id: Id<"businesses">;
  name: string;
};

export type FiredTrigger = {
  triggerId: string;
  webhookUrl: string;
  action: string;
};

/** After intent scoring — hot-lead Slack + optional churn n8n workflow */
export async function runPipelineAutomation(args: {
  visitor: VisitorSnapshot;
  business: BusinessSnapshot;
  intelligence: IntelligenceResult;
}): Promise<{ hotLeadFired: boolean; churnFired: boolean }> {
  const hotLeadFired = await fireHotLeadIfNeeded({
    visitorName: args.visitor.crmData?.name,
    intentScore: args.intelligence.intentScore,
    recommendedAction: args.intelligence.recommendedAction,
    visitorId: args.visitor._id,
    businessId: args.business._id,
    businessName: args.business.name,
  });

  const churnFired = await fireChurnEmailIfNeeded({
    visitor: args.visitor,
    businessId: args.business._id,
    intentScore: args.intelligence.intentScore,
  });

  return { hotLeadFired, churnFired };
}

export async function fireHotLeadIfNeeded(args: {
  visitorName?: string;
  intentScore: number;
  recommendedAction?: string;
  visitorId: string;
  businessId: string;
  businessName?: string;
}): Promise<boolean> {
  if (args.intentScore < HOT_LEAD_THRESHOLD) return false;
  if (!process.env.N8N_WEBHOOK_SLACK?.trim()) return false;

  await fireSlackWebhook({
    type: "hot_lead",
    name: args.visitorName ?? "Unknown",
    intentScore: args.intentScore,
    recommendedAction: args.recommendedAction,
    visitorId: args.visitorId,
    businessId: args.businessId,
    businessName: args.businessName,
  });

  return true;
}

export async function fireChurnEmailIfNeeded(args: {
  visitor: VisitorSnapshot;
  businessId: string;
  intentScore: number;
}): Promise<boolean> {
  if (args.visitor.crmData?.churnRisk !== "high") return false;
  if (!process.env.N8N_WEBHOOK_CHURN?.trim()) return false;

  await fireChurnWebhook({
    type: "churn_risk",
    name: args.visitor.crmData?.name,
    email: args.visitor.crmData?.email,
    visitorId: args.visitor._id,
    businessId: args.businessId,
    intentScore: args.intentScore,
    churnRisk: args.visitor.crmData?.churnRisk,
  });

  return true;
}

/** Fire webhooks returned from Convex triggers.evaluateAndFire */
export async function fireTriggersFromConvex(
  fired: FiredTrigger[],
  payload: Record<string, unknown>
): Promise<number> {
  let count = 0;
  for (const t of fired) {
    if (!t.webhookUrl?.trim()) continue;
    await fireTriggerWebhook(t.webhookUrl, {
      ...payload,
      triggerId: t.triggerId,
      action: t.action,
    });
    count += 1;
  }
  return count;
}

/** Post-call: triggers + Slack + CRM push (BeyondPresence webhook) */
export async function runPostCallAutomation(args: {
  visitorId: Id<"visitors">;
  businessId: Id<"businesses">;
  visitor: VisitorSnapshot | null;
  intelligence: {
    intentScore?: number;
    recommendedAction?: string;
  } | null;
  firedTriggers: FiredTrigger[];
  session: {
    transcript: unknown[];
    outcome: string;
    sentimentArc: unknown[];
    actionItems: string[];
    duration: number;
  };
}): Promise<{
  firedTriggerCount: number;
  hotLeadFired: boolean;
  crmPushFired: boolean;
}> {
  const intentScore = args.intelligence?.intentScore ?? 0;

  const firedTriggerCount = await fireTriggersFromConvex(args.firedTriggers, {
    type: "trigger",
    visitorId: args.visitorId,
    businessId: args.businessId,
    intentScore,
    name: args.visitor?.crmData?.name,
    recommendedAction: args.intelligence?.recommendedAction,
  });

  const hotLeadFired = await fireHotLeadIfNeeded({
    visitorName: args.visitor?.crmData?.name,
    intentScore,
    recommendedAction: args.intelligence?.recommendedAction,
    visitorId: args.visitorId,
    businessId: args.businessId,
  });

  void forwardCrmPush({
    visitorId: args.visitorId,
    businessId: args.businessId,
    intentScore,
    transcript: args.session.transcript,
    outcome: args.session.outcome,
    actionItems: args.session.actionItems,
  });

  return {
    firedTriggerCount,
    hotLeadFired,
    crmPushFired: Boolean(process.env.N8N_WEBHOOK_CRM_PUSH?.trim()),
  };
}
