#!/usr/bin/env node
/**
 * Verifies all backend layers: env, build, optional Convex sync.
 * Run: npm run verify:all
 * Full (n8n URLs required): npm run verify:full
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  loadEnvVars,
  isN8nUrlValid,
  N8N_REQUIRED_KEYS,
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
    name: fullMode
      ? "Env full (.env.local + n8n webhooks)"
      : "Env (.env.local + check:env)",
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
    name: "n8n webhook smoke test",
    key: "n8n",
    cmd: ["node", ["scripts/validate-n8n-webhooks.mjs"]],
    skip: !fullMode,
  },
];

const results = { env: false, envFull: false, build: false, convex: false, n8n: false };

console.log(
  `\nPresenceIQ — verify all backend layers${fullMode ? " (full)" : ""}\n`
);

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
  results.n8n = run("node", ["scripts/validate-n8n-webhooks.mjs"]);
} else {
  results.n8n = true;
}

function printIntegrationSummary() {
  const vars = loadEnvVars();
  if (!vars) return;

  console.log("\nIntegration summary:\n");
  const n8nRows = N8N_REQUIRED_KEYS.map((k) => [
    k.replace("N8N_WEBHOOK_", "").toLowerCase(),
    isN8nUrlValid(vars[k]) ? "configured" : "missing",
  ]);
  const churn = vars.N8N_WEBHOOK_CHURN?.trim();
  if (churn) {
    n8nRows.push(["churn", isN8nUrlValid(churn) ? "configured" : "invalid"]);
  }

  console.log("  Integration          Status");
  console.log("  ───────────────────  ──────────");
  console.log(
    `  n8n CRM fetch        ${isN8nUrlValid(vars.N8N_WEBHOOK_CRM_FETCH) ? "configured" : "missing"}`
  );
  console.log(
    `  n8n Slack            ${isN8nUrlValid(vars.N8N_WEBHOOK_SLACK) ? "configured" : "missing"}`
  );
  console.log(
    `  n8n CRM push         ${isN8nUrlValid(vars.N8N_WEBHOOK_CRM_PUSH) ? "configured" : "missing"}`
  );
  console.log(
    `  n8n churn (opt)      ${churn ? (isN8nUrlValid(churn) ? "configured" : "invalid") : "not set"}`
  );
  console.log(
    `  Seylan sandbox       ${vars.SEYLAN_API_KEY?.trim() ? "configured" : "missing"}`
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
  ? results.envFull && results.build && results.convex && results.n8n
  : results.env && results.build && results.convex;

console.log(
  allOk
    ? `\nAll layers passed${fullMode ? " (full stack including n8n)" : ""}.\n`
    : "\nFix failed layers — see SETUP.md\n"
);
process.exit(allOk ? 0 : 1);
