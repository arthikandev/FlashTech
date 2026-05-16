import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SessionDetailResult } from "@/convex/types";

type Props = {
  detail: SessionDetailResult | null | undefined;
};

export function SlackAlertCard({ detail }: Props) {
  const score = detail?.intelligence?.intentScore;
  const name = detail?.visitor.crmData?.name ?? "Visitor";
  const isHot = score != null && score >= 80;

  return (
    <Card
      className={
        isHot ? "border-emerald-500/40 bg-emerald-950/20" : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground">#sales-alerts</h3>
        <Link to="/slack" className="text-[10px] text-primary hover:underline">
          Full mock →
        </Link>
      </CardHeader>
      <CardContent>
        {isHot ? (
          <div className="flex gap-3 text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-700 text-xs font-bold text-white">
              PIQ
            </div>
            <div>
              <p className="font-medium text-foreground">Hot lead — {name}</p>
              <p className="mt-1 text-muted-foreground">
                Intent <strong className="text-emerald-400">{score}</strong>/100 ·{" "}
                {detail?.intelligence?.recommendedAction ?? "Follow up"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">n8n hot-lead-slack · live</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Hot lead alerts appear when intent ≥ 80. Run the Seylan demo and reload pricing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
