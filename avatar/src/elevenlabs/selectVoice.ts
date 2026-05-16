/** Demo voice map — replace IDs with your ElevenLabs voice IDs */
const VOICES: Record<string, Record<string, string>> = {
  bank: { en: "en-bank-formal", si: "si-bank", ta: "ta-bank" },
  saas: { en: "en-saas-friendly", si: "en-saas-friendly", ta: "en-saas-friendly" },
  hotel: { en: "en-hotel-warm", si: "en-hotel-warm", ta: "en-hotel-warm" },
  hospital: { en: "en-clinical-calm", si: "en-clinical-calm", ta: "en-clinical-calm" },
  ecommerce: { en: "en-retail-upbeat", si: "en-retail-upbeat", ta: "en-retail-upbeat" },
  hr: { en: "en-hr-neutral", si: "en-hr-neutral", ta: "en-hr-neutral" },
};

export function selectVoiceId(
  industry: string,
  language: string
): string | undefined {
  const lang = language.slice(0, 2).toLowerCase();
  const map = VOICES[industry] ?? VOICES.saas;
  return map[lang] ?? map.en;
}
