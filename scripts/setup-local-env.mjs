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

// Ensure Convex URL is set in frontend .env.local even if file was empty
const fePath = join(root, "frontend/.env.local");
if (existsSync(fePath)) {
  let text = readFileSync(fePath, "utf8");
  if (!/^VITE_CONVEX_URL=.+/m.test(text)) {
    text = text.replace(
      /^VITE_CONVEX_URL=.*$/m,
      `VITE_CONVEX_URL=${CONVEX_URL}`
    );
    if (!text.includes("VITE_CONVEX_URL=")) {
      text += `\nVITE_CONVEX_URL=${CONVEX_URL}\n`;
    }
    writeFileSync(fePath, text, "utf8");
    console.log("updated: frontend/.env.local (VITE_CONVEX_URL)");
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
  writeFileSync(bePath, text, "utf8");
  console.log("verified: backend/.env.local (Convex + app URL)");
}

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
