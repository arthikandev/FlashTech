export type EnvCheckResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
  checks: {
    convex: "configured" | "missing";
    openai: "configured" | "missing";
    n8nCrm: "configured" | "demo_mock";
    n8nSlack: "configured" | "missing";
    n8nCrmPush: "configured" | "missing";
    n8nChurn: "configured" | "missing";
    seylan: "configured" | "demo_fallback" | "missing";
    beyondPresence: "configured" | "missing";
    webhookSecrets: "configured" | "partial" | "missing";
  };
};

import { isBeyondPresenceConfigured } from "./beyondPresenceApi";
import { isSeylanApiConfigured } from "./seylanApi";

export { isBeyondPresenceConfigured };

const DEMO_EMBED_KEYS = ["seylan-demo", "cloudmetrics-demo", "coral-demo"];

export { isSeylanApiConfigured };

export function checkEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const openaiKey = process.env.OPENAI_API_KEY;
  const n8nCrmFetch = process.env.N8N_WEBHOOK_CRM_FETCH;
  const n8nSlack = process.env.N8N_WEBHOOK_SLACK;
  const n8nCrmPush = process.env.N8N_WEBHOOK_CRM_PUSH;
  const n8nChurn = process.env.N8N_WEBHOOK_CHURN;
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET;
  const bpSecret = process.env.BP_WEBHOOK_SECRET;
  const bpApiConfigured = isBeyondPresenceConfigured();
  const seylanConfigured = isSeylanApiConfigured();

  if (!convexUrl) missing.push("NEXT_PUBLIC_CONVEX_URL");
  if (!openaiKey?.trim()) {
    missing.push("OPENAI_API_KEY");
    warnings.push("Intent API uses demo fallback for Sarangan without OPENAI_API_KEY");
  }

  if (!n8nCrmFetch?.trim()) {
    if (seylanConfigured) {
      warnings.push(
        "N8N_WEBHOOK_CRM_FETCH empty — using Seylan sandbox CRM (demo mock if sandbox fails)"
      );
    } else {
      warnings.push("N8N_WEBHOOK_CRM_FETCH empty — using built-in demo CRM mock");
    }
  }

  if (!n8nSlack?.trim()) {
    warnings.push("N8N_WEBHOOK_SLACK empty — hot-lead Slack automation disabled");
  }

  if (!n8nCrmPush?.trim()) {
    warnings.push("N8N_WEBHOOK_CRM_PUSH empty — post-call CRM push disabled");
  }

  if (!seylanConfigured && !n8nCrmFetch?.trim()) {
    warnings.push("SEYLAN_API_* not set — fingerprint uses demo CRM mock only");
  }

  if (!n8nSecret?.trim() || !bpSecret?.trim()) {
    warnings.push("Webhook secrets use dev defaults when unset in non-production");
  }

  if (!bpApiConfigured) {
    warnings.push(
      "BEYONDPRESENCE_API_KEY empty — pipeline will not sync agent context to Beyond Presence"
    );
  }

  const webhookSecrets =
    n8nSecret?.trim() && bpSecret?.trim()
      ? "configured"
      : n8nSecret?.trim() || bpSecret?.trim()
        ? "partial"
        : "missing";

  const seylanCheck: EnvCheckResult["checks"]["seylan"] = seylanConfigured
    ? "configured"
    : n8nCrmFetch?.trim()
      ? "missing"
      : "demo_fallback";

  return {
    ok: missing.length === 0,
    missing,
    warnings,
    checks: {
      convex: convexUrl ? "configured" : "missing",
      openai: openaiKey?.trim() ? "configured" : "missing",
      n8nCrm: n8nCrmFetch?.trim() ? "configured" : "demo_mock",
      n8nSlack: n8nSlack?.trim() ? "configured" : "missing",
      n8nCrmPush: n8nCrmPush?.trim() ? "configured" : "missing",
      n8nChurn: n8nChurn?.trim() ? "configured" : "missing",
      seylan: seylanCheck,
      beyondPresence: bpApiConfigured ? "configured" : "missing",
      webhookSecrets,
    },
  };
}

export function getDemoEmbedKeys(): string[] {
  return DEMO_EMBED_KEYS;
}

export function isN8nCrmConfigured(): boolean {
  return Boolean(process.env.N8N_WEBHOOK_CRM_FETCH?.trim());
}

export function getIntegrationsStatus() {
  const env = checkEnv();
  return {
    n8n: {
      crmFetch: env.checks.n8nCrm === "configured",
      slack: env.checks.n8nSlack === "configured",
      crmPush: env.checks.n8nCrmPush === "configured",
      churn: env.checks.n8nChurn === "configured",
    },
    seylan: env.checks.seylan === "configured",
    beyondPresence: env.checks.beyondPresence === "configured",
  };
}
