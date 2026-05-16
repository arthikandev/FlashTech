#!/usr/bin/env node
/**
 * POST smoke test to each n8n webhook URL in .env.local.
 * Run: npm run validate:n8n
 */
import {
  loadEnvVars,
  isN8nUrlValid,
  envPath,
  N8N_REQUIRED_KEYS,
  N8N_OPTIONAL_KEYS,
} from "./lib/env-parse.mjs";
import { existsSync } from "fs";

const TIMEOUT_MS = 10_000;

async function pingWebhook(name, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test: true,
        source: "presenceiq-validate-n8n",
        workflow: name,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const ok = res.status >= 200 && res.status < 300;
    return { ok, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.message };
  }
}

console.log("\nPresenceIQ — n8n webhook validation\n");

if (!existsSync(envPath)) {
  console.log("✗  .env.local not found\n");
  process.exit(1);
}

const vars = loadEnvVars();
const toTest = [
  ...N8N_REQUIRED_KEYS.map((key) => ({ key, required: true })),
  ...N8N_OPTIONAL_KEYS.map((key) => ({ key, required: false })),
];

let failed = 0;
let skipped = 0;

for (const { key, required } of toTest) {
  const url = vars[key]?.trim();
  if (!url) {
    if (required) {
      console.log(`  ✗  ${key.padEnd(28)} missing`);
      failed++;
    } else {
      console.log(`  ○  ${key.padEnd(28)} not set (optional)`);
      skipped++;
    }
    continue;
  }
  if (!isN8nUrlValid(url)) {
    console.log(`  ✗  ${key.padEnd(28)} invalid URL`);
    failed++;
    continue;
  }
  process.stdout.write(`  …  ${key.padEnd(28)} pinging…`);
  const result = await pingWebhook(key, url);
  if (result.ok) {
    console.log(`\r  ✓  ${key.padEnd(28)} HTTP ${result.status}`);
  } else if (result.status) {
    console.log(`\r  ✗  ${key.padEnd(28)} HTTP ${result.status}`);
    if (required) failed++;
  } else {
    console.log(`\r  ✗  ${key.padEnd(28)} ${result.error}`);
    if (required) failed++;
  }
}

console.log();
if (failed > 0) {
  console.log(`${failed} required webhook(s) failed. Check n8n Cloud → Executions.\n`);
  process.exit(1);
}
console.log("All configured n8n webhooks responded OK.\n");
