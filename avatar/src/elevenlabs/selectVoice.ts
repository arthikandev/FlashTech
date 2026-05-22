import catalog from "./voiceCatalog.json";
import type { VoiceTone } from "../tone";

type CatalogEntry = { voiceId: string; label?: string };

function pickFromCatalog(
  industry: string,
  language: string,
  tone?: VoiceTone
): string | undefined {
  const root = catalog as {
    voices: Record<string, Record<string, CatalogEntry>>;
    toneOverrides?: Record<string, string>;
  };
  if (tone && root.toneOverrides?.[tone]) {
    return root.toneOverrides[tone];
  }
  const lang = language.slice(0, 2).toLowerCase();
  const map = root.voices[industry] ?? root.voices.saas;
  return map?.[lang]?.voiceId ?? map?.en?.voiceId;
}

export function selectVoiceId(
  industry: string,
  language: string,
  tone?: VoiceTone
): string | undefined {
  return pickFromCatalog(industry, language, tone);
}
