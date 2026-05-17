#!/usr/bin/env node
/**
 * One-screen backend integration status from .env.local
 * Run: npm run status
 */
import { existsSync } from "fs";
import {
  loadEnvVars,
  envPath,
  isAutomationWebhookUrlValid,
  webhookCrmFetchUrl,
  webhookSlackHotLeadUrl,
  webhookCrmPushUrl,
  webhookChurnRiskUrl,
} from "./lib/env-parse.mjs";

function yn(set) {
  return set ? "yes" : "no";
}

console.log("\nPresenceIQ backend — status\n");

if (!existsSync(envPath)) {
  console.log("  .env.local     missing — cp .env.example .env.local\n");
  process.exit(1);
}

const v = loadEnvVars();

const inboundOk = Boolean(
  v.INBOUND_WEBHOOK_SECRET?.trim() || v.N8N_WEBHOOK_SECRET?.trim()
);

const rows = [
  ["Convex", Boolean(v.NEXT_PUBLIC_CONVEX_URL?.trim())],
  ["OpenAI", Boolean(v.OPENAI_API_KEY?.trim())],
  [
    "Clerk",
    Boolean(
      v.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && v.CLERK_SECRET_KEY?.trim()
    ),
  ],
  [
    "Seylan API",
    Boolean(v.SEYLAN_API_BASE_URL?.trim() && v.SEYLAN_API_KEY?.trim()),
  ],
  ["Beyond Presence", Boolean(v.BEYONDPRESENCE_API_KEY?.trim())],
  [
    "Webhook secrets",
    Boolean(inboundOk && v.BP_WEBHOOK_SECRET?.trim()),
  ],
];

for (const [name, ok] of rows) {
  console.log(`  ${ok ? "✓" : "○"}  ${name.padEnd(20)} ${yn(ok)}`);
}

const cf = webhookCrmFetchUrl(v);
const slack = webhookSlackHotLeadUrl(v);
const push = webhookCrmPushUrl(v);
const churn = webhookChurnRiskUrl(v);

console.log("\n  Outbound HTTPS webhooks (automation/Zapier/Make/etc.):");
console.log(
  `  ${isAutomationWebhookUrlValid(cf) ? "✓" : "✗"}  CRM fetch trigger        ${cf ? "set" : "missing"}`
);
console.log(
  `  ${isAutomationWebhookUrlValid(slack) ? "✓" : "✗"}  Slack hot-lead          ${slack ? "set" : "missing"}`
);
console.log(
  `  ${isAutomationWebhookUrlValid(push) ? "✓" : "✗"}  CRM push                ${push ? "set" : "missing"}`
);
console.log(
  `  ${churn ? (isAutomationWebhookUrlValid(churn) ? "✓" : "✗") : "○"}  churn workflow (optional) ${churn ? "" : "not set"}`
);

const appUrl = v.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
console.log(`\n  App URL: ${appUrl}`);
console.log("\n  Next steps:");
console.log("    npm run verify:all       — env + build + Convex");
console.log("    npm run verify:full      — includes outbound webhook pings");
console.log("    npm run validate:webhooks — POST ping each webhook URL");
console.log("    npm run test:webhooks    — E2E (dev server required)\n");

if (
  !isAutomationWebhookUrlValid(cf) ||
  !isAutomationWebhookUrlValid(slack) ||
  !isAutomationWebhookUrlValid(push)
) {
  console.log("  Paste HTTPS webhook URLs → backend/.env.local (WEBHOOK_* keys)\n");
}
