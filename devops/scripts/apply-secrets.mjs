#!/usr/bin/env node
/**
 * Merge devops/.secrets.local into backend/.env.local (and optional avatar/.env.local).
 * Run after: node devops/scripts/generate-secrets.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const secretsPath = path.join(root, "devops", ".secrets.local");

if (!fs.existsSync(secretsPath)) {
  console.error("Missing devops/.secrets.local — run: node devops/scripts/generate-secrets.js");
  process.exit(1);
}

const secrets = Object.fromEntries(
  fs
    .readFileSync(secretsPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

function upsertEnvFile(filePath, keys) {
  const examplePath = filePath.replace(/\.local$/, ".example").replace(/\/\.env$/, "/.env.example");
  let content = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : fs.existsSync(examplePath)
      ? fs.readFileSync(examplePath, "utf8")
      : "";

  for (const [key, value] of Object.entries(keys)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    content = re.test(content)
      ? content.replace(re, line)
      : `${content.trimEnd()}\n${line}\n`;
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${path.relative(root, filePath)}`);
}

upsertEnvFile(path.join(root, "backend", ".env.local"), {
  BP_WEBHOOK_SECRET: secrets.BP_WEBHOOK_SECRET,
  INBOUND_WEBHOOK_SECRET: secrets.INBOUND_WEBHOOK_SECRET ?? secrets.N8N_WEBHOOK_SECRET,
  N8N_WEBHOOK_SECRET: secrets.N8N_WEBHOOK_SECRET ?? secrets.INBOUND_WEBHOOK_SECRET,
});

const avatarEnv = path.join(root, "avatar", ".env.local");
if (fs.existsSync(avatarEnv) || fs.existsSync(path.join(root, "avatar", ".env.example"))) {
  upsertEnvFile(avatarEnv, {
    VITE_BP_WEBHOOK_SECRET: secrets.BP_WEBHOOK_SECRET,
  });
}

const referencePath = path.join(root, "devops", "automation-reference.env");
fs.writeFileSync(
  referencePath,
  `# Paste into your automation tool if it needs static values (gitignored by devops/.gitignore if you add it)

INBOUND_WEBHOOK_SECRET=${secrets.INBOUND_WEBHOOK_SECRET ?? secrets.N8N_WEBHOOK_SECRET ?? ""}
PRESENCEIQ_BACKEND_URL=https://backend-blond-theta-13.vercel.app
`,
  "utf8"
);
console.log(`Wrote ${path.relative(root, referencePath)}`);
