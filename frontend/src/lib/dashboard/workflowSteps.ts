import type { TriggerRow } from "@/hooks/useTriggers";

export type WorkflowStepKey = "crm" | "intent" | "bp" | "slack" | "email";

export type WorkflowStepStatus = {
  key: WorkflowStepKey;
  label: string;
  done: boolean;
  detail?: string;
};

const STEP_LABELS: Record<WorkflowStepKey, string> = {
  crm: "CRM fetch",
  intent: "Intent scoring",
  bp: "BP agent sync",
  slack: "Slack alert",
  email: "Email follow-up",
};

export function computeWorkflowSteps(input: {
  hasIntelligence: boolean;
  hasConversation: boolean;
  hasCrmData: boolean;
  hasBpAgent: boolean;
  triggers?: TriggerRow[];
}): WorkflowStepStatus[] {
  const firedSlack = input.triggers?.some(
    (t) => t.action === "slack_alert" && t.lastFiredAt != null
  );
  const firedCrm = input.triggers?.some(
    (t) =>
      (t.action === "crm_push" || t.action === "email_sequence") && t.lastFiredAt != null
  );

  const done: Record<WorkflowStepKey, boolean> = {
    crm: input.hasCrmData || input.hasIntelligence,
    intent: input.hasIntelligence,
    bp: input.hasBpAgent && input.hasIntelligence,
    slack: firedSlack ?? (input.hasIntelligence && (input.triggers?.length ?? 0) > 0),
    email: firedCrm ?? input.hasConversation,
  };

  return (Object.keys(STEP_LABELS) as WorkflowStepKey[]).map((key) => ({
    key,
    label: STEP_LABELS[key],
    done: done[key],
    detail:
      key === "slack" && firedSlack
        ? "Trigger fired"
        : key === "email" && firedCrm
          ? "Trigger fired"
          : undefined,
  }));
}
