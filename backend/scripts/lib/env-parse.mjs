import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const envPath = resolve(__dirname, "../../.env.local");

export function parseEnv(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

export function loadEnvVars() {
  if (!existsSync(envPath)) return null;
  return parseEnv(readFileSync(envPath, "utf8"));
}

const AUTOMATION_PLACEHOLDER_RE =
  /your-instance|YOUR\.app\.n8n|your-team|change-me|example\.com|your-domain|^https?:\/\/localhost/i;

export function isAutomationWebhookUrlValid(url) {
  if (!url?.trim()) return false;
  const v = url.trim();
  if (AUTOMATION_PLACEHOLDER_RE.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function webhookCrmFetchUrl(vars) {
  return (
    vars.WEBHOOK_CRM_FETCH_TRIGGER?.trim() ||
    vars.N8N_WEBHOOK_CRM_FETCH?.trim() ||
    ""
  );
}

export function webhookSlackHotLeadUrl(vars) {
  return (
    vars.WEBHOOK_SLACK_HOT_LEAD?.trim() ||
    vars.N8N_WEBHOOK_SLACK?.trim() ||
    ""
  );
}

export function webhookCrmPushUrl(vars) {
  return (
    vars.WEBHOOK_CRM_PUSH?.trim() || vars.N8N_WEBHOOK_CRM_PUSH?.trim() || ""
  );
}

export function webhookChurnRiskUrl(vars) {
  return (
    vars.WEBHOOK_CHURN_RISK?.trim() || vars.N8N_WEBHOOK_CHURN?.trim() || ""
  );
}

export const AUTOMATION_FULL_CHECK = [
  { label: "crm_fetch_trigger", resolver: webhookCrmFetchUrl },
  { label: "slack_hot_lead", resolver: webhookSlackHotLeadUrl },
  { label: "crm_push", resolver: webhookCrmPushUrl },
];

