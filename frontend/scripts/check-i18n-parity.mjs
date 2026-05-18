#!/usr/bin/env node
// Verifies that ta.ts covers every key declared in en.ts (and vice versa).
// Parses the source files with a key-extracting regex — no TS toolchain required.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const enPath = resolve(root, "src/landing/i18n/messages/en.ts");
const taPath = resolve(root, "src/landing/i18n/messages/ta.ts");

function extractKeys(src) {
  const keys = new Set();
  const re = /^\s*"([^"]+)"\s*:/gm;
  let m;
  while ((m = re.exec(src)) !== null) keys.add(m[1]);
  return keys;
}

const enKeys = extractKeys(readFileSync(enPath, "utf8"));
const taKeys = extractKeys(readFileSync(taPath, "utf8"));

const missingInTa = [...enKeys].filter((k) => !taKeys.has(k));
const extraInTa = [...taKeys].filter((k) => !enKeys.has(k));

if (missingInTa.length === 0 && extraInTa.length === 0) {
  console.log(`i18n parity OK (${enKeys.size} keys).`);
  process.exit(0);
}

if (missingInTa.length) {
  console.error(`Missing in ta.ts (${missingInTa.length}):`);
  for (const k of missingInTa) console.error(`  - ${k}`);
}
if (extraInTa.length) {
  console.error(`Extra in ta.ts not in en.ts (${extraInTa.length}):`);
  for (const k of extraInTa) console.error(`  - ${k}`);
}
process.exit(1);
