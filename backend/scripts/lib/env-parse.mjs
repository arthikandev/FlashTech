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

const N8N_PLACEHOLDER_RE =
  /your-instance|YOUR\.app\.n8n|your-team|change-me|example\.com/i;

export function isN8nUrlValid(url) {
  if (!url?.trim()) return false;
  const v = url.trim();
  if (N8N_PLACEHOLDER_RE.test(v)) return false;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return false;
    if (!u.pathname.includes("/webhook/")) return false;
    return true;
  } catch {
    return false;
  }
}

export const N8N_REQUIRED_KEYS = [
  "N8N_WEBHOOK_CRM_FETCH",
  "N8N_WEBHOOK_SLACK",
  "N8N_WEBHOOK_CRM_PUSH",
];

export const N8N_OPTIONAL_KEYS = ["N8N_WEBHOOK_CHURN"];
