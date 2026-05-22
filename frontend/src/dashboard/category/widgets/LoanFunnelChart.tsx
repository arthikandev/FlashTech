import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stage = {
  label: string;
  value: number;
};

function FunnelBar({ stage, max }: { readonly stage: Stage; readonly max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((stage.value / max) * 100)) : 4;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{stage.label}</span>
        <span className="tabular-nums font-medium text-foreground">
          {stage.value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/80 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function LoanFunnelChart() {
  const { businessId } = useTenant();
  const data = useQuery(
    api.categoryStats.bankingLoanFunnel,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  const stages: Stage[] = [
    { label: "Inquiries", value: data?.inquiries ?? 0 },
    { label: "Eligibility checked", value: data?.eligibility ?? 0 },
    { label: "Application intent", value: data?.application ?? 0 },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Loan funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((s) => (
          <FunnelBar key={s.label} stage={s} max={max} />
        ))}
        {data && data.inquiries === 0 ? (
          <p className="pt-1 text-xs text-muted-foreground">
            No loan-shaped conversations yet. Run a scenario mentioning "loan"
            or "EMI" to see the funnel populate.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
