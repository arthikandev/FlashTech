/** Voice / persona tone derived from intent and visitor context (PDF: emotion-aware delivery). */
export type VoiceTone = "calm" | "warm" | "urgent" | "professional";

const INDUSTRY_DEFAULT: Record<string, VoiceTone> = {
  bank: "professional",
  saas: "warm",
  hotel: "warm",
  hospital: "calm",
  ecommerce: "warm",
  hr: "professional",
};

export function intentToVoiceTone(args: {
  intentScore: number;
  industry: string;
  churnRisk?: string | null;
  sentimentScore?: number | null;
}): VoiceTone {
  if (args.churnRisk === "high") return "calm";
  if (args.sentimentScore != null && args.sentimentScore < 0.35) return "calm";
  if (args.intentScore >= 80) return "urgent";
  if (args.sentimentScore != null && args.sentimentScore > 0.85) return "warm";

  return INDUSTRY_DEFAULT[args.industry] ?? "professional";
}

export function toneToPersonaHint(tone: VoiceTone): string {
  switch (tone) {
    case "calm":
      return "calm, reassuring";
    case "warm":
      return "warm, welcoming";
    case "urgent":
      return "focused, action-oriented";
    case "professional":
    default:
      return "formal, trustworthy";
  }
}
