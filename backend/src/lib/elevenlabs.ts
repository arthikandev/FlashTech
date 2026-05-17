import { readFileSync } from "fs";
import { resolve } from "path";
import type { VoiceTone } from "./tone";

export type VoiceCatalogEntry = {
  voiceId: string;
  label?: string;
};

type VoiceCatalogFile = {
  version?: number;
  syncedAt?: string | null;
  voices: Record<string, Record<string, VoiceCatalogEntry>>;
  toneOverrides?: Record<string, string>;
};

let catalogCache: VoiceCatalogFile | null = null;

function loadCatalog(): VoiceCatalogFile {
  if (catalogCache) return catalogCache;
  const paths = [
    resolve(process.cwd(), "../shared/elevenlabs-voice-catalog.json"),
    resolve(process.cwd(), "shared/elevenlabs-voice-catalog.json"),
  ];
  for (const p of paths) {
    try {
      const raw = readFileSync(p, "utf8");
      catalogCache = JSON.parse(raw) as VoiceCatalogFile;
      return catalogCache;
    } catch {
      /* try next */
    }
  }
  catalogCache = { voices: {}, toneOverrides: {} };
  return catalogCache;
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export type ElevenLabsVoiceSummary = {
  voice_id: string;
  name?: string;
  labels?: Record<string, string>;
};

export async function listVoices(): Promise<ElevenLabsVoiceSummary[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return [];

  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { voices?: ElevenLabsVoiceSummary[] };
  return data.voices ?? [];
}

export function selectVoiceForContext(args: {
  industry: string;
  language: string;
  tone?: VoiceTone;
}): { voiceId: string; label?: string; tone: VoiceTone } {
  const catalog = loadCatalog();
  const lang = args.language.slice(0, 2).toLowerCase();
  const industry = args.industry in catalog.voices ? args.industry : "saas";
  const tone = args.tone ?? "professional";

  const toneOverride = catalog.toneOverrides?.[tone];
  if (toneOverride) {
    return { voiceId: toneOverride, tone, label: `tone:${tone}` };
  }

  const industryMap = catalog.voices[industry] ?? catalog.voices.saas ?? {};
  const entry = industryMap[lang] ?? industryMap.en;
  if (entry?.voiceId) {
    return { voiceId: entry.voiceId, label: entry.label, tone };
  }

  return {
    voiceId: "pNInz6obpgDQGcFmaJgB",
    label: "default",
    tone,
  };
}
