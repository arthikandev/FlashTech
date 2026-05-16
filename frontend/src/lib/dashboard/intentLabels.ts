import { HOT_LEAD_THRESHOLD } from "./metrics";

export type IntentTier = "cold" | "warm" | "hot" | "critical";

export function getIntentTier(score: number | null | undefined): IntentTier {
  if (score == null) return "cold";
  if (score >= 90) return "critical";
  if (score >= HOT_LEAD_THRESHOLD) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

export function intentTierLabel(tier: IntentTier): string {
  switch (tier) {
    case "critical":
      return "Critical";
    case "hot":
      return "Hot";
    case "warm":
      return "Warm";
    default:
      return "Cold";
  }
}

export function intentBadgeVariant(
  tier: IntentTier
): "default" | "secondary" | "outline" | "destructive" {
  switch (tier) {
    case "critical":
      return "destructive";
    case "hot":
      return "default";
    case "warm":
      return "secondary";
    default:
      return "outline";
  }
}
