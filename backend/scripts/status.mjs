#!/usr/bin/env node
/**
 * One-screen backend integration status from .env.local
 * Run: npm run status
 */
import { existsSync } from "fs";
import {
  loadEnvVars,
  envPath,
  isN8nUrlValid,
  N8N_REQUIRED_KEYS,
  N8N_OPTIONAL_KEYS,
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

const rows = [
  ["Convex", Boolean(v.NEXT_PUBLIC_CONVEX_URL?.trim())],
  ["OpenAI", Boolean(v.OPENAI_API_KEY?.trim())],
  ["Clerk", Boolean(v.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && v.CLERK_SECRET_KEY?.trim())],
  ["Seylan API", Boolean(v.SEYLAN_API_BASE_URL?.trim() && v.SEYLAN_API_KEY?.trim())],
  ["Beyond Presence", Boolean(v.BEYONDPRESENCE_API_KEY?.trim())],
  ["Webhook secrets", Boolean(v.N8N_WEBHOOK_SECRET?.trim() && v.BP_WEBHOOK_SECRET?.trim())],
];

for (const [name, ok] of rows) {
  console.log(`  ${ok ? "✓" : "○"}  ${name.padEnd(20)} ${yn(ok)}`);
}

console.log("\n  n8n webhooks:");
for (const key of N8N_REQUIRED_KEYS) {
  const ok = isN8nUrlValid(v[key]);
  console.log(`  ${ok ? "✓" : "✗"}  ${key.padEnd(28)} ${ok ? "configured" : "missing/invalid"}`);
}
for (const key of N8N_OPTIONAL_KEYS) {
  const url = v[key]?.trim();
  const ok = url ? isN8nUrlValid(url) : false;
  const label = !url ? "not set" : ok ? "configured" : "invalid";
  console.log(`  ${ok ? "✓" : url ? "✗" : "○"}  ${key.padEnd(28)} ${label}`);
}

const appUrl = v.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
console.log(`\n  App URL: ${appUrl}`);
console.log("\n  Next steps:");
console.log("    npm run verify:all     — env + build + Convex");
console.log("    npm run verify:full    — includes n8n URL checks");
console.log("    npm run validate:n8n   — ping n8n webhooks");
console.log("    npm run test:n8n       — E2E (dev server must be running)\n");

const allN8n = N8N_REQUIRED_KEYS.every((k) => isN8nUrlValid(v[k]));
if (!allN8n) {
  console.log("  Paste n8n Production Webhook URLs → backend/.env.local");
  console.log("  Guide: devops/n8n/README.md\n");
}
