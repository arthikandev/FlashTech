/**
 * ElevenLabs voice IDs — replace with your account IDs from ElevenLabs dashboard.
 * Configure in BeyondPresence agent settings per language.
 */
export const VOICE_BY_LANGUAGE: Record<string, string> = {
  en: "REPLACE_WITH_ELEVENLABS_EN_VOICE_ID",
  si: "REPLACE_WITH_ELEVENLABS_SI_VOICE_ID",
  ta: "REPLACE_WITH_ELEVENLABS_TA_VOICE_ID",
};

export function voiceIdForLanguage(language: string, industry?: string): string {
  const lang = language.toLowerCase().slice(0, 2);
  const base = VOICE_BY_LANGUAGE[lang] ?? VOICE_BY_LANGUAGE.en;
  if (industry === "bank" && lang === "en") {
    return base;
  }
  return base;
}
