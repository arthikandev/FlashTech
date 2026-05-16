#!/usr/bin/env node
/**
 * Writes frontend/public/runtime-config.json when PRESENCEIQ_BACKEND_URL or
 * VITE_BACKEND_URL is set (CI / deploy). Skips if unset so local file is kept.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendUrl =
  process.env.PRESENCEIQ_BACKEND_URL?.trim() ||
  process.env.VITE_BACKEND_URL?.trim();
const convexUrl =
  process.env.PRESENCEIQ_CONVEX_URL?.trim() ||
  process.env.VITE_CONVEX_URL?.trim() ||
  process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

if (!backendUrl && !convexUrl) {
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "frontend/public/runtime-config.json");
const existing = existsSync(out)
  ? JSON.parse(readFileSync(out, "utf8"))
  : { backendUrl: "http://localhost:3001", convexUrl: "https://adamant-puffin-769.convex.cloud" };

if (backendUrl) existing.backendUrl = backendUrl.replace(/\/$/, "");
if (convexUrl) existing.convexUrl = convexUrl.replace(/\/$/, "");

writeFileSync(out, `${JSON.stringify(existing, null, 2)}\n`);
console.log("runtime-config.json updated", existing);
