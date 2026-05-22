import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CandidatePipelineKanban() {
  const { businessId } = useTenant();
  const stages = useQuery(
    api.categoryStats.hrPipelineByStage,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Candidate pipeline (by intent score)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!stages ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-4">
            {stages.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-background px-3 py-3"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {s.count}
                </p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
          Stages are derived from intent score bands (Applied &lt; 30,
          Screened 30-60, Interview 60-85, Offer ≥ 85). Connect Greenhouse to
          replace with real ATS stages.
        </p>
      </CardContent>
    </Card>
  );
}
