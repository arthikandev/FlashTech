#!/usr/bin/env node
/**
 * POST smoke tests for outbound HTTPS automation URLs (.env.local).
 * Run: npm run validate:webhooks
 */
import {
  AUTOMATION_FULL_CHECK,
  loadEnvVars,
  isAutomationWebhookUrlValid,
  webhookChurnRiskUrl,
  envPath,
} from "./lib/env-parse.mjs";
import { existsSync } from "fs";

const TIMEOUT_MS = 10_000;

async function pingWebhook(label, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test: true,
        source: "presenceiq-validate-automation-webhooks",
        workflow: label,
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

console.log("\nPresenceIQ — automation webhook validation\n");

if (!existsSync(envPath)) {
  console.log("✗  .env.local not found\n");
  process.exit(1);
}

const vars = loadEnvVars();
const toTest = [
  ...AUTOMATION_FULL_CHECK.map(({ label, resolver }) => ({
    label,
    url: resolver(vars),
    required: true,
  })),
  {
    label: "churn_risk_optional",
    url: webhookChurnRiskUrl(vars),
    required: false,
  },
];

let failed = 0;

for (const { label, url, required } of toTest) {
  if (!url?.trim()) {
    if (required) {
      console.log(`  ✗  ${label.padEnd(28)} missing (set WEBHOOK_* or legacy N8N_WEBHOOK_*)`);
      failed++;
    } else {
      console.log(`  ○  ${label.padEnd(28)} not set (optional)`);
    }
    continue;
  }
  if (!isAutomationWebhookUrlValid(url)) {
    console.log(`  ✗  ${label.padEnd(28)} invalid HTTPS URL`);
    if (required) failed++;
    continue;
  }
  process.stdout.write(`  …  ${label.padEnd(28)} pinging…`);
  const result = await pingWebhook(label, url);
  if (result.ok) {
    console.log(`\r  ✓  ${label.padEnd(28)} HTTP ${result.status}`);
  } else if (result.status !== undefined && result.status) {
    console.log(`\r  ✗  ${label.padEnd(28)} HTTP ${result.status}`);
    if (required) failed++;
  } else {
    console.log(`\r  ✗  ${label.padEnd(28)} ${result.error}`);
    if (required) failed++;
  }
}

console.log();
if (failed > 0) {
  console.log(`${failed} required outbound webhook URL(s) failed — check upstream automation.\n`);
  process.exit(1);
}
console.log("All configured automation webhooks responded OK.\n");
