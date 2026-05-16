import { Link } from "react-router-dom";
import type { SessionDetailResult } from "@/convex/types";

type Props = {
  detail: SessionDetailResult | null | undefined;
};

export function SlackAlertCard({ detail }: Props) {
  const score = detail?.intelligence?.intentScore;
  const name = detail?.visitor.crmData?.name ?? "Visitor";
  const isHot = score != null && score >= 80;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isHot ? "border-emerald-500/40 bg-emerald-950/20" : "border-[#212121] bg-[#101010]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">#sales-alerts</h3>
        <Link to="/slack" className="text-[10px] text-primary hover:underline">
          Full mock →
        </Link>
      </div>
      {isHot ? (
        <div className="flex gap-3 text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-700 text-xs font-bold text-white">
            PIQ
          </div>
          <div>
            <p className="font-medium text-[#E1E0CC]">Hot lead — {name}</p>
            <p className="mt-1 text-gray-400">
              Intent <strong className="text-emerald-400">{score}</strong>/100 ·{" "}
              {detail?.intelligence?.recommendedAction ?? "Follow up"}
            </p>
            <p className="mt-1 text-[10px] text-gray-600">n8n hot-lead-slack · live</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Hot lead alerts appear when intent ≥ 80. Run the Seylan demo and reload pricing.
        </p>
      )}
    </div>
  );
}
