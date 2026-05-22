#!/usr/bin/env node
/**
 * Checks backend/.env.local for required PresenceIQ keys.
 * Run: npm run check:env
 * Full (outbound webhook URLs required): npm run check:env:full
 */
import {
  envPath,
  loadEnvVars,
  isAutomationWebhookUrlValid,
  AUTOMATION_FULL_CHECK,
  webhookChurnRiskUrl,
  webhookCrmFetchUrl,
} from "./lib/env-parse.mjs";
import { existsSync } from "fs";

const fullMode = process.argv.includes("--full");

function status(key, value, required, demoOk = false, automationWebhook = false) {
  const set = Boolean(value?.trim());
  const placeholder =
    value?.includes("your-") ||
    value?.includes("change-me") ||
    value === "sk-your-openai-key-here" ||
    value?.includes("pk_test_your") ||
    value?.includes("sk_test_your") ||
    value?.includes("your-team-api-key") ||
    value?.includes("your-beyondpresence-key") ||
    (automationWebhook && set && !isAutomationWebhookUrlValid(value));

  if (!set && required) return { icon: "✗", label: "MISSING (required)" };
  if (!set && demoOk)
    return { icon: "!", label: "empty (demo fallback for Sarangan)" };
  if (!set) return { icon: "○", label: "empty (optional)" };
  if (placeholder) {
    if (automationWebhook)
      return { icon: "!", label: "invalid or placeholder automation URL" };
    return { icon: "!", label: "set but still placeholder" };
  }
  return { icon: "✓", label: "configured" };
}

const checks = [
  { key: "NEXT_PUBLIC_CONVEX_URL", required: true },
  { key: "CONVEX_DEPLOYMENT", required: false },
  { key: "OPENAI_API_KEY", required: false, demoOk: true },
  { key: "NEXT_PUBLIC_APP_URL", required: true },
  {
    key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    required: false,
    clerkDashboard: true,
  },
  { key: "CLERK_SECRET_KEY", required: false, clerkDashboard: true },
  { key: "INBOUND_WEBHOOK_SECRET", required: false },
  { key: "N8N_WEBHOOK_SECRET", required: false },
  { key: "BEYONDPRESENCE_API_KEY", required: false, bpKey: true },
  { key: "ELEVENLABS_API_KEY", required: false, elevenLabs: true },
  { key: "BEYONDPRESENCE_API_BASE_URL", required: false },
  { key: "BP_WEBHOOK_SECRET", required: false },
  { key: "WEBHOOK_CRM_FETCH_TRIGGER", required: false, automationWebhook: true },
  { key: "N8N_WEBHOOK_CRM_FETCH", required: false, automationWebhook: true },
  { key: "WEBHOOK_SLACK_HOT_LEAD", required: false, automationWebhook: true },
  { key: "N8N_WEBHOOK_SLACK", required: false, automationWebhook: true },
  { key: "WEBHOOK_CRM_PUSH", required: false, automationWebhook: true },
  { key: "N8N_WEBHOOK_CRM_PUSH", required: false, automationWebhook: true },
  { key: "WEBHOOK_CHURN_RISK", required: false, automationWebhook: true },
  { key: "N8N_WEBHOOK_CHURN", required: false, automationWebhook: true },
  { key: "CONVEX_DEPLOY_KEY", required: false },
];

console.log(
  `\nPresenceIQ backend — environment check${fullMode ? " (full — outbound webhooks)" : ""}\n`
);

if (!existsSync(envPath)) {
  console.log("✗  .env.local not found");
  console.log("   Run: cp .env.example .env.local\n");
  process.exit(1);
}

const vars = loadEnvVars();
let hasRequiredMissing = false;
let hasPlaceholder = false;
let clerkMissing = false;

for (const { key, required, demoOk, clerkDashboard, automationWebhook } of checks) {
  const { icon, label } = status(
    key,
    vars[key],
    required,
    demoOk,
    automationWebhook
  );
  console.log(`  ${icon}  ${key.padEnd(28)} ${label}`);
  if (required && label.startsWith("MISSING")) hasRequiredMissing = true;
  if (label.includes("placeholder") || label.includes("invalid")) {
    hasPlaceholder = true;
  }
  if (
    clerkDashboard &&
    (!vars[key]?.trim() || label.includes("placeholder"))
  ) {
    clerkMissing = true;
  }
}

console.log("\n  Convex deployment (run separately):");
console.log(
  "     npx convex env get CLERK_JWT_ISSUER_DOMAIN  (optional, for dashboard)\n"
);

if (fullMode) {
  const failures = [];
  for (const { label, resolver } of AUTOMATION_FULL_CHECK) {
    const url = resolver(vars);
    if (!isAutomationWebhookUrlValid(url)) failures.push(label);
  }
  if (failures.length > 0) {
    console.log("✗  Full mode requires valid HTTPS webhook URLs:\n");
    for (const f of failures) console.log(`     ${f}`);
    console.log(
      "\n   Set WEBHOOK_CRM_FETCH_TRIGGER, WEBHOOK_SLACK_HOT_LEAD, WEBHOOK_CRM_PUSH (or legacy N8N_WEBHOOK_* equivalents).\n"
    );
    process.exit(1);
  }
  const churnStr = webhookChurnRiskUrl(vars);
  if (churnStr && !isAutomationWebhookUrlValid(churnStr)) {
    console.log(
      "  !  churn webhook URL set but invalid — fix WEBHOOK_CHURN_RISK or remove\n"
    );
  }
  console.log(
    "All required keys + outbound automation webhook URLs present.\n"
  );
  process.exit(0);
}

const cf = webhookCrmFetchUrl(vars);
if (!cf || !isAutomationWebhookUrlValid(cf)) {
  console.log(
    "  ℹ  WEBHOOK_CRM_FETCH_TRIGGER / N8N_WEBHOOK_CRM_FETCH unset → fingerprint API skips CRM enrichment\n"
  );
}

if (hasRequiredMissing) {
  console.log("Fix required keys in .env.local — see SETUP.md\n");
  process.exit(1);
}

if (hasPlaceholder) {
  console.log("Replace placeholder values before production — see SETUP.md\n");
  process.exit(1);
}

if (!vars.OPENAI_API_KEY?.trim()) {
  console.log(
    "  ℹ  Add OPENAI_API_KEY for live GPT-4o scoring — demo fallback works without it.\n"
  );
}

if (!vars.BEYONDPRESENCE_API_KEY?.trim()) {
  console.log(
    "  ℹ  Add BEYONDPRESENCE_API_KEY to sync pipeline intelligence to your BP agent — see docs/BEYOND_PRESENCE.md\n"
  );
}

if (!vars.ELEVENLABS_API_KEY?.trim()) {
  console.log(
    "  ℹ  Add ELEVENLABS_API_KEY for voice probe (4/4 integrations) — run: npm run sync:elevenlabs\n"
  );
}

if (clerkMissing) {
  console.log(
    "  ℹ  Add Clerk keys for /dashboard — see SETUP.md and https://clerk.com/docs/nextjs/getting-started/quickstart\n"
  );
}

console.log("All required keys present.\n");
