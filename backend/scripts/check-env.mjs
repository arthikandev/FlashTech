#!/usr/bin/env node
/**
 * Checks backend/.env.local for required PresenceIQ keys.
 * Run: npm run check:env
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function parseEnv(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function status(key, value, required, demoOk = false) {
  const set = Boolean(value?.trim());
  const placeholder =
    value?.includes("your-") ||
    value?.includes("change-me") ||
    value === "sk-your-openai-key-here" ||
    value?.includes("pk_test_your") ||
    value?.includes("sk_test_your") ||
    value?.includes("your-team-api-key");
  if (!set && required) return { icon: "✗", label: "MISSING (required)" };
  if (!set && demoOk)
    return { icon: "!", label: "empty (demo fallback for Sarangan)" };
  if (!set) return { icon: "○", label: "empty (optional)" };
  if (placeholder) return { icon: "!", label: "set but still placeholder" };
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
  { key: "BP_WEBHOOK_SECRET", required: false },
  { key: "SEYLAN_API_BASE_URL", required: false },
  { key: "SEYLAN_API_KEY", required: false },
  { key: "SEYLAN_CUSTOMER_LOOKUP_PATH", required: false },
  { key: "SEYLAN_DEMO_ACCOUNT_NUMBER", required: false },
  { key: "N8N_WEBHOOK_CRM_FETCH", required: false },
  { key: "N8N_WEBHOOK_CRM_PUSH", required: false },
  { key: "N8N_WEBHOOK_SLACK", required: false },
  { key: "CONVEX_DEPLOY_KEY", required: false },
];

console.log("\nPresenceIQ backend — environment check\n");

if (!existsSync(envPath)) {
  console.log("✗  .env.local not found");
  console.log("   Run: cp .env.example .env.local\n");
  process.exit(1);
}

const vars = parseEnv(readFileSync(envPath, "utf8"));
let hasRequiredMissing = false;
let hasPlaceholder = false;

let clerkMissing = false;

for (const { key, required, demoOk, clerkDashboard } of checks) {
  const { icon, label } = status(key, vars[key], required, demoOk);
  console.log(`  ${icon}  ${key.padEnd(28)} ${label}`);
  if (required && label.startsWith("MISSING")) hasRequiredMissing = true;
  if (label.includes("placeholder")) hasPlaceholder = true;
  if (clerkDashboard && (!vars[key]?.trim() || label.includes("placeholder"))) {
    clerkMissing = true;
  }
}

console.log("\n  Convex deployment (run separately):");
console.log("     npx convex env get CLERK_JWT_ISSUER_DOMAIN  (optional, for dashboard)\n");

if (!vars.N8N_WEBHOOK_CRM_FETCH?.trim()) {
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

if (clerkMissing) {
  console.log(
    "  ℹ  Add Clerk keys for /dashboard — see SETUP.md and https://clerk.com/docs/nextjs/getting-started/quickstart\n"
  );
}

console.log("All required keys present.\n");
