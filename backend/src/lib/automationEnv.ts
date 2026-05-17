/**
 * Outbound webhook triggers (CRM fetch handoff, Slack hot-lead, post-call CRM log).
 * Primary env vars are neutral; legacy N8N_* aliases remain supported for existing deploys.
 */
function trimEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

export function envCrmFetchTriggerUrl(): string | undefined {
  return (
    trimEnv("WEBHOOK_CRM_FETCH_TRIGGER") || trimEnv("N8N_WEBHOOK_CRM_FETCH")
  );
}

export function envSlackHotLeadUrl(): string | undefined {
  return trimEnv("WEBHOOK_SLACK_HOT_LEAD") || trimEnv("N8N_WEBHOOK_SLACK");
}

export function envCrmPushUrl(): string | undefined {
  return trimEnv("WEBHOOK_CRM_PUSH") || trimEnv("N8N_WEBHOOK_CRM_PUSH");
}

export function envChurnRiskWebhookUrl(): string | undefined {
  return trimEnv("WEBHOOK_CHURN_RISK") || trimEnv("N8N_WEBHOOK_CHURN");
}

/** Secret callers send when POSTing enriched CRM rows back to our backend */
export function envInboundCrmWebhookSecret(): string | undefined {
  return (
    trimEnv("INBOUND_WEBHOOK_SECRET") || trimEnv("N8N_WEBHOOK_SECRET")
  );
}

export function isCrmFetchWebhookConfigured(): boolean {
  return Boolean(envCrmFetchTriggerUrl());
}
