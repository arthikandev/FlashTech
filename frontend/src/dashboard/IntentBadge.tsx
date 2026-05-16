import { Badge } from "@/components/ui/badge";
import { getIntentTier, intentBadgeVariant, intentTierLabel } from "@/lib/dashboard/intentLabels";

export function IntentBadge({ score }: { score?: number }) {
  if (score == null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        —
      </Badge>
    );
  }
  const tier = getIntentTier(score);
  return (
    <Badge variant={intentBadgeVariant(tier)}>
      {score} · {intentTierLabel(tier)}
    </Badge>
  );
}
