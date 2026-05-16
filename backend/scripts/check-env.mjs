#!/usr/bin/env node
/**
 * Checks backend/.env.local for required PresenceIQ keys.
 * Run: npm run check:env
 * Full (requires n8n webhooks): npm run check:env:full
 */
import {
  envPath,
  loadEnvVars,
  isN8nUrlValid,
  N8N_REQUIRED_KEYS,
  N8N_OPTIONAL_KEYS,
} from "./lib/env-parse.mjs";
import { existsSync } from "fs";

const fullMode = process.argv.includes("--full");

function status(key, value, required, demoOk = false, n8nKey = false) {
  const set = Boolean(value?.trim());
  const placeholder =
    value?.includes("your-") ||
    value?.includes("change-me") ||
    value === "sk-your-openai-key-here" ||
    value?.includes("pk_test_your") ||
    value?.includes("sk_test_your") ||
    value?.includes("your-team-api-key") ||
    value?.includes("your-beyondpresence-key") ||
    (n8nKey && set && !isN8nUrlValid(value));

  if (!set && required) return { icon: "✗", label: "MISSING (required)" };
  if (!set && demoOk)
    return { icon: "!", label: "empty (demo fallback for Sarangan)" };
  if (!set) return { icon: "○", label: "empty (optional)" };
  if (placeholder) {
    if (n8nKey) return { icon: "!", label: "invalid or placeholder n8n URL" };
    return { icon: "!", label: "set but still placeholder" };
  }
  return { icon: "✓", label: "configured" };
}

const checks = [
  { key: "NEXT_PUBLIC_CONVEX_URL", required: true },
  { key: "CONVEX_DEPLOYMENT", required: false },
  { key: "OPENAI_API_KEY", required: false, demoOk: true },
  { key: "NEXT_PUBLIC_APP_URL", required: true },
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", required: false, clerkDashboard: true },
  { key: "CLERK_SECRET_KEY", required: false, clerkDashboard: true },
  { key: "N8N_WEBHOOK_SECRET", required: false },
  { key: "BEYONDPRESENCE_API_KEY", required: false, bpKey: true },
  { key: "BEYONDPRESENCE_API_BASE_URL", required: false },
  { key: "BP_WEBHOOK_SECRET", required: false },
  { key: "SEYLAN_API_BASE_URL", required: false },
  { key: "SEYLAN_API_KEY", required: false },
  { key: "SEYLAN_CUSTOMER_LOOKUP_PATH", required: false },
  { key: "SEYLAN_DEMO_ACCOUNT_NUMBER", required: false },
  { key: "N8N_WEBHOOK_CRM_FETCH", required: false, n8nKey: true },
  { key: "N8N_WEBHOOK_SLACK", required: false, n8nKey: true },
  { key: "N8N_WEBHOOK_CRM_PUSH", required: false, n8nKey: true },
  { key: "N8N_WEBHOOK_CHURN", required: false, n8nKey: true },
  { key: "CONVEX_DEPLOY_KEY", required: false },
];

console.log(
  `\nPresenceIQ backend — environment check${fullMode ? " (full — n8n required)" : ""}\n`
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
const n8nFullFailures = [];

for (const { key, required, demoOk, clerkDashboard, n8nKey } of checks) {
  const req = fullMode && N8N_REQUIRED_KEYS.includes(key) ? true : required;
  const { icon, label } = status(key, vars[key], req, demoOk, n8nKey);
  console.log(`  ${icon}  ${key.padEnd(28)} ${label}`);
  if (req && label.startsWith("MISSING")) hasRequiredMissing = true;
  if (label.includes("placeholder") || label.includes("invalid")) {
    hasPlaceholder = true;
    if (fullMode && N8N_REQUIRED_KEYS.includes(key)) {
      n8nFullFailures.push(key);
    }
  }
  if (clerkDashboard && (!vars[key]?.trim() || label.includes("placeholder"))) {
    clerkMissing = true;
  }
}

console.log("\n  Convex deployment (run separately):");
console.log("     npx convex env get CLERK_JWT_ISSUER_DOMAIN  (optional, for dashboard)\n");

if (fullMode) {
  for (const key of N8N_REQUIRED_KEYS) {
    if (!isN8nUrlValid(vars[key])) {
      if (!n8nFullFailures.includes(key)) n8nFullFailures.push(key);
    }
  }
  if (n8nFullFailures.length > 0) {
    console.log("✗  Full mode requires valid n8n Production Webhook URLs:\n");
    for (const key of n8nFullFailures) {
      console.log(`     ${key}`);
    }
    console.log("\n   Import workflows: devops/n8n/README.md");
    console.log("   Paste URLs from n8n Cloud → Active → Production Webhook URL\n");
    process.exit(1);
  }
  const churn = vars.N8N_WEBHOOK_CHURN?.trim();
  if (churn && !isN8nUrlValid(churn)) {
    console.log("  !  N8N_WEBHOOK_CHURN set but invalid — fix or remove (optional)\n");
  }
  console.log("All required keys + n8n webhooks present.\n");
  process.exit(0);
}

if (!vars.N8N_WEBHOOK_CRM_FETCH?.trim() || !isN8nUrlValid(vars.N8N_WEBHOOK_CRM_FETCH)) {
  if (vars.SEYLAN_API_BASE_URL?.trim() && vars.SEYLAN_API_KEY?.trim()) {
    console.log(
      "  ℹ  N8N empty → Seylan sandbox CRM on fingerprint (demo mock if sandbox fails)\n"
    );
  } else {
    console.log("  ℹ  N8N_WEBHOOK_CRM_FETCH empty → demo CRM mock enabled in fingerprint API\n");
  }
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

if (clerkMissing) {
  console.log(
    "  ℹ  Add Clerk keys for /dashboard — see SETUP.md and https://clerk.com/docs/nextjs/getting-started/quickstart\n"
  );
}

console.log("All required keys present.\n");
