#!/usr/bin/env node
/**
 * Writes frontend/public/runtime-config.json when PRESENCEIQ_BACKEND_URL or
 * VITE_BACKEND_URL is set (CI / deploy). Skips if unset so local file is kept.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const url =
  process.env.PRESENCEIQ_BACKEND_URL?.trim() ||
  process.env.VITE_BACKEND_URL?.trim();

if (!url) {
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "frontend/public/runtime-config.json");
writeFileSync(out, `${JSON.stringify({ backendUrl: url.replace(/\/$/, "") }, null, 2)}\n`);
console.log(`runtime-config.json → ${url.replace(/\/$/, "")}`);
