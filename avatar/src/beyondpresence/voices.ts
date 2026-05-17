import catalog from "../elevenlabs/voiceCatalog.json";

type CatalogEntry = { voiceId: string; label?: string };

export const VOICE_BY_LANGUAGE: Record<string, string> = {
  en: (catalog as { voices: { saas: { en: CatalogEntry } } }).voices.saas.en.voiceId,
  si: (catalog as { voices: { saas: { si: CatalogEntry } } }).voices.saas.si.voiceId,
  ta: (catalog as { voices: { saas: { ta: CatalogEntry } } }).voices.saas.ta.voiceId,
};

export function voiceIdForLanguage(language: string, industry?: string): string {
  const lang = language.toLowerCase().slice(0, 2);
  const ind = industry && industry in (catalog as { voices: Record<string, unknown> }).voices
    ? industry
    : "saas";
  const map = (catalog as { voices: Record<string, Record<string, CatalogEntry>> }).voices[
    ind
  ];
  return map?.[lang]?.voiceId ?? map?.en?.voiceId ?? VOICE_BY_LANGUAGE.en;
}
