#!/usr/bin/env node
/**
 * Creates frontend/.env.local and backend/.env.local from examples when missing.
 * Safe to run repeatedly — skips files that already exist.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const CONVEX_URL = "https://adamant-puffin-769.convex.cloud";
const CONVEX_DEPLOYMENT = "dev:adamant-puffin-769";
const CLERK_ISSUER = "https://integral-lamprey-56.clerk.accounts.dev";

function readEnvValue(filePath, key) {
  if (!existsSync(filePath)) return "";
  const text = readFileSync(filePath, "utf8");
  const match = text.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function upsertEnvLine(text, key, value) {
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(text)) {
    return text.replace(new RegExp(`^${key}=.*$`, "m"), line);
  }
  return `${text.trimEnd()}\n${line}\n`;
}

function ensureFile(relPath, content) {
  const path = join(root, relPath);
  if (existsSync(path)) {
    console.log(`skip (exists): ${relPath}`);
    return;
  }
  writeFileSync(path, content, "utf8");
  console.log(`created: ${relPath}`);
}

function copyExample(relExample, relLocal) {
  const example = join(root, relExample);
  const local = join(root, relLocal);
  if (existsSync(local)) {
    console.log(`skip (exists): ${relLocal}`);
    return;
  }
  if (!existsSync(example)) {
    console.warn(`missing example: ${relExample}`);
    return;
  }
  copyFileSync(example, local);
  console.log(`created: ${relLocal} (from example)`);
}

copyExample("frontend/.env.example", "frontend/.env.local");
copyExample("backend/.env.example", "backend/.env.local");

// Ensure Convex + Clerk keys in frontend .env.local
const fePath = join(root, "frontend/.env.local");
const feDevPath = join(root, "frontend/.env.development");
const bePathEarly = join(root, "backend/.env.local");
const clerkFromDev = readEnvValue(feDevPath, "VITE_CLERK_PUBLISHABLE_KEY");
const clerkFromBackend = readEnvValue(bePathEarly, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
const clerkPk = clerkFromDev || clerkFromBackend;

if (existsSync(fePath)) {
  let text = readFileSync(fePath, "utf8");
  let changed = false;
  if (!/^VITE_CONVEX_URL=.+/m.test(text)) {
    text = upsertEnvLine(text, "VITE_CONVEX_URL", CONVEX_URL);
    changed = true;
  }
  if (clerkPk && !/^VITE_CLERK_PUBLISHABLE_KEY=.+/m.test(text)) {
    text = upsertEnvLine(text, "VITE_CLERK_PUBLISHABLE_KEY", clerkPk);
    changed = true;
  }
  if (changed) {
    writeFileSync(fePath, text, "utf8");
    console.log("updated: frontend/.env.local (VITE_CONVEX_URL / VITE_CLERK_PUBLISHABLE_KEY)");
  }
}

// Backend: align app URL with friend's default port
const bePath = join(root, "backend/.env.local");
if (existsSync(bePath)) {
  let text = readFileSync(bePath, "utf8");
  if (!text.includes("NEXT_PUBLIC_APP_URL=")) {
    text += "\nNEXT_PUBLIC_APP_URL=http://localhost:3001\n";
  }
  text = text.replace(
    /^NEXT_PUBLIC_APP_URL=http:\/\/localhost:3000$/m,
    "NEXT_PUBLIC_APP_URL=http://localhost:3001"
  );
  if (!/^CONVEX_DEPLOYMENT=.+/m.test(text)) {
    text += `CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}\n`;
  }
  if (!/^NEXT_PUBLIC_CONVEX_URL=.+/m.test(text)) {
    text += `NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL}\n`;
  }
  const backendPk = readEnvValue(bePath, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const backendPkPlaceholder =
    !backendPk || backendPk.includes("your-publishable-key");
  if (clerkPk && (!/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.+/m.test(text) || backendPkPlaceholder)) {
    text = upsertEnvLine(text, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", clerkPk);
  }
  writeFileSync(bePath, text, "utf8");
  console.log("verified: backend/.env.local (Convex + app URL)");
}

console.log(
  `\nClerk Convex issuer (run from backend/ if not set):\n  npx convex env set CLERK_JWT_ISSUER_DOMAIN ${CLERK_ISSUER}\n`
);

const runtimePath = join(root, "frontend/public/runtime-config.json");
let runtime = { backendUrl: "http://localhost:3001", convexUrl: CONVEX_URL };
if (existsSync(runtimePath)) {
  try {
    runtime = { ...runtime, ...JSON.parse(readFileSync(runtimePath, "utf8")) };
  } catch {
    /* overwrite broken file */
  }
}
runtime.convexUrl = runtime.convexUrl || CONVEX_URL;
runtime.backendUrl = runtime.backendUrl || "http://localhost:3001";
writeFileSync(runtimePath, `${JSON.stringify(runtime, null, 2)}\n`);
console.log("updated: frontend/public/runtime-config.json");

console.log("\nNext: in backend/ run  npx convex dev  (keeps Convex functions in sync)");
