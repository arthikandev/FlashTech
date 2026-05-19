#!/usr/bin/env node
/**
 * Verifies all backend layers: env, build, optional Convex sync.
 * Run: npm run verify:all
 * Full (outbound webhooks required): npm run verify:full
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  loadEnvVars,
  isAutomationWebhookUrlValid,
  webhookCrmFetchUrl,
  webhookSlackHotLeadUrl,
  webhookCrmPushUrl,
  webhookChurnRiskUrl,
} from "./lib/env-parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const fullMode = process.argv.includes("--full");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  return r.status === 0;
}

const layers = [
  {
    name: fullMode ? "Env full (.env.local + webhook URLs)" : "Env (.env.local + check:env)",
    key: fullMode ? "envFull" : "env",
    skip: false,
  },
  { name: "Next.js build (API + dashboard)", key: "build", cmd: ["npm", ["run", "build"]] },
  {
    name: "Convex functions (dev --once)",
    key: "convex",
    cmd: ["npx", ["convex", "dev", "--once"]],
  },
  {
    name: "Outbound automation webhook smoke tests",
    key: "webhooks",
    cmd: ["node", ["scripts/validate-automation-webhooks.mjs"]],
    skip: !fullMode,
  },
];

const results = { env: false, envFull: false, build: false, convex: false, webhooks: false };

console.log(`\nPresenceIQ — verify all backend layers${fullMode ? " (full)" : ""}\n`);

if (!existsSync(resolve(root, ".env.local"))) {
  console.log("✗  .env.local missing — run: cp .env.example .env.local\n");
  process.exit(1);
}

if (fullMode) {
  results.env = true;
  results.envFull = run("node", ["scripts/check-env.mjs", "--full"]);
} else {
  results.env = run("npm", ["run", "check:env"]);
  results.envFull = true;
}

results.build = run("npm", ["run", "build"]);

const hasConvex = existsSync(resolve(root, "node_modules/.bin/convex"));
if (hasConvex) {
  results.convex = run("npx", ["convex", "dev", "--once"]);
} else {
  console.log("○  Convex CLI skipped (not installed)\n");
  results.convex = true;
}

if (fullMode) {
  results.webhooks = run("node", ["scripts/validate-automation-webhooks.mjs"]);
} else {
  results.webhooks = true;
}

function printIntegrationSummary() {
  const vars = loadEnvVars();
  if (!vars) return;

  const churn = webhookChurnRiskUrl(vars);
  console.log("\nIntegration summary:\n");
  console.log("  Integration          Status");
  console.log("  ───────────────────  ──────────");
  console.log(
    `  CRM fetch trigger    ${isAutomationWebhookUrlValid(webhookCrmFetchUrl(vars)) ? "configured" : "missing"}`
  );
  console.log(
    `  Slack hot-lead       ${isAutomationWebhookUrlValid(webhookSlackHotLeadUrl(vars)) ? "configured" : "missing"}`
  );
  console.log(
    `  CRM push             ${isAutomationWebhookUrlValid(webhookCrmPushUrl(vars)) ? "configured" : "missing"}`
  );
  console.log(
    `  Churn workflow (opt) ${churn ? (isAutomationWebhookUrlValid(churn) ? "configured" : "invalid") : "not set"}`
  );
  console.log(
    `  OpenAI               ${vars.OPENAI_API_KEY?.trim() ? "configured" : "demo fallback"}`
  );
  console.log(
    `  Beyond Presence      ${vars.BEYONDPRESENCE_API_KEY?.trim() ? "configured" : "missing"}`
  );
  console.log();
}

printIntegrationSummary();

console.log("Layer summary:\n");
for (const layer of layers) {
  if (layer.skip || !layer.name) continue;
  const ok = results[layer.key];
  console.log(`  ${ok ? "✓" : "✗"}  ${layer.name}`);
}

const allOk = fullMode
  ? results.envFull && results.build && results.convex && results.webhooks
  : results.env && results.build && results.convex;

console.log(
  allOk
    ? `\nAll layers passed${fullMode ? " (full stack including outbound webhooks)" : ""}.\n`
    : "\nFix failed layers — see SETUP.md\n"
);

if (results.build) {
  console.log(
    "  ℹ  If `npm run dev` was running during verify, restart with: npm run dev:clean\n"
  );
}

process.exit(allOk ? 0 : 1);
