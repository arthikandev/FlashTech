import {
  envChurnRiskWebhookUrl,
  envCrmFetchTriggerUrl,
  envCrmPushUrl,
  envInboundCrmWebhookSecret,
  envSlackHotLeadUrl,
} from "./automationEnv";
export type EnvCheckResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
  checks: {
    convex: "configured" | "missing";
    openai: "configured" | "missing";
    elevenLabs: "configured" | "missing";
    automationCrmFetch: "configured" | "missing";
    automationSlackHotLead: "configured" | "missing";
    automationCrmPush: "configured" | "missing";
    automationChurn: "configured" | "missing";
    beyondPresence: "configured" | "missing";
    webhookSecrets: "configured" | "partial" | "missing";
  };
};

import { isBeyondPresenceConfigured } from "./beyondPresenceApi";

export { isBeyondPresenceConfigured };

export function checkEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const openaiKey = process.env.OPENAI_API_KEY;
  const crmFetchTrigger = envCrmFetchTriggerUrl();
  const slackHotLead = envSlackHotLeadUrl();
  const crmPush = envCrmPushUrl();
  const churn = envChurnRiskWebhookUrl();
  const inboundSecret = envInboundCrmWebhookSecret();
  const bpSecret = process.env.BP_WEBHOOK_SECRET;
  const bpApiConfigured = isBeyondPresenceConfigured();
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  if (!convexUrl) missing.push("NEXT_PUBLIC_CONVEX_URL");
  if (!openaiKey?.trim()) {
    missing.push("OPENAI_API_KEY");
  }
  if (!elevenLabsKey?.trim()) {
    warnings.push(
      "ElevenLabs voice probe is skipped without ELEVENLABS_API_KEY (optional — set for 4/4 integration pills)"
    );
  }

  if (!inboundSecret?.trim() || !bpSecret?.trim()) {
    warnings.push("Webhook secrets use dev defaults when unset in non-production");
  }

  if (!bpApiConfigured) {
    warnings.push(
      "BEYONDPRESENCE_API_KEY empty — pipeline will not sync agent context to Beyond Presence"
    );
  }

  const webhookSecrets =
    inboundSecret?.trim() && bpSecret?.trim()
      ? "configured"
      : inboundSecret?.trim() || bpSecret?.trim()
        ? "partial"
        : "missing";

  return {
    ok: missing.length === 0,
    missing,
    warnings,
    checks: {
      convex: convexUrl ? "configured" : "missing",
      openai: openaiKey?.trim() ? "configured" : "missing",
      elevenLabs: elevenLabsKey?.trim() ? "configured" : "missing",
      automationCrmFetch: crmFetchTrigger ? "configured" : "missing",
      automationSlackHotLead: slackHotLead ? "configured" : "missing",
      automationCrmPush: crmPush ? "configured" : "missing",
      automationChurn: churn ? "configured" : "missing",
      beyondPresence: bpApiConfigured ? "configured" : "missing",
      webhookSecrets,
    },
  };
}

export function getIntegrationsStatus() {
  const env = checkEnv();
  return {
    automation: {
      crmFetch: env.checks.automationCrmFetch === "configured",
      slackHotLead: env.checks.automationSlackHotLead === "configured",
      crmPush: env.checks.automationCrmPush === "configured",
      churnRisk: env.checks.automationChurn === "configured",
    },
    beyondPresence: env.checks.beyondPresence === "configured",
  };
}
