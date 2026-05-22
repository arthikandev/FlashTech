#!/usr/bin/env node
/**
 * Fetches ElevenLabs voices and updates shared/elevenlabs-voice-catalog.json.
 * Run: npm run sync:elevenlabs  (from backend/)
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { loadEnvVars } from "./lib/env-parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const catalogPath = resolve(root, "../shared/elevenlabs-voice-catalog.json");
const avatarCatalogPath = resolve(root, "../avatar/src/elevenlabs/voiceCatalog.json");

const vars = loadEnvVars();
const apiKey = vars.ELEVENLABS_API_KEY?.trim();

if (!apiKey) {
  console.error("ELEVENLABS_API_KEY not set in backend/.env.local");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": apiKey },
});
if (!res.ok) {
  console.error(`ElevenLabs API failed: HTTP ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const voices = data.voices ?? [];
if (voices.length === 0) {
  console.error("No voices returned from ElevenLabs");
  process.exit(1);
}

function pickVoice(nameIncludes) {
  const v = voices.find((x) =>
    (x.name ?? "").toLowerCase().includes(nameIncludes)
  );
  return v?.voice_id ?? voices[0].voice_id;
}

const formalId = pickVoice("adam") || voices[0].voice_id;
const warmId = pickVoice("bella") || pickVoice("rachel") || formalId;
const calmId = pickVoice("daniel") || pickVoice("josh") || formalId;

let catalog = { version: 1, syncedAt: null, voices: {}, toneOverrides: {} };
if (existsSync(catalogPath)) {
  catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
}

const entry = (voiceId, label) => ({ voiceId, label });

const industries = ["bank", "saas", "hotel", "hospital", "ecommerce", "hr"];
for (const ind of industries) {
  const enVoice =
    ind === "bank" || ind === "hr"
      ? formalId
      : ind === "hospital"
        ? calmId
        : warmId;
  catalog.voices[ind] = {
    en: entry(enVoice, `synced EN for ${ind}`),
    si: entry(enVoice, "EN fallback for SI"),
    ta: entry(enVoice, "EN fallback for TA"),
  };
}

catalog.syncedAt = new Date().toISOString();
catalog.toneOverrides = {
  urgent: formalId,
  calm: calmId,
  warm: warmId,
  professional: formalId,
};

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(avatarCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Updated ${catalogPath}`);
console.log(`Updated ${avatarCatalogPath}`);
console.log(`Voices in account: ${voices.length}`);
