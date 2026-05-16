#!/usr/bin/env node
/**
 * D0 — Generate shared webhook secrets for Person 1 → Person 2 handoff.
 * Writes devops/.secrets.local (gitignored). Do not commit.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", ".secrets.local");

const bp = crypto.randomBytes(32).toString("hex");
const n8n = crypto.randomBytes(32).toString("hex");

const content = `# Generated ${new Date().toISOString()}
# Share with Person 2 for backend/.env.local and Vercel
# Share BP_WEBHOOK_SECRET with avatar/demo/config.js

BP_WEBHOOK_SECRET=${bp}
N8N_WEBHOOK_SECRET=${n8n}
`;

fs.writeFileSync(outPath, content, "utf8");
console.log(`Wrote ${outPath}`);
console.log("\nHandoff to Person 2 — add to backend/.env.local:");
console.log(`BP_WEBHOOK_SECRET=${bp}`);
console.log(`N8N_WEBHOOK_SECRET=${n8n}`);
