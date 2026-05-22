import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Sparkles } from "lucide-react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tier = "starter" | "growth" | "enterprise";

const TIER_BLURB: Record<Tier, string> = {
  starter: "Solo builders and pilots. 250 intelligence calls per month.",
  growth: "Single growing workspace. 2,500 intelligence calls per month.",
  enterprise: "Multi-region, SSO, audit retention. 25,000 calls per month.",
};

export function AdminBilling() {
  const { businessId } = useTenant();
  const state = useQuery(
    api.billing.getBillingState,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );
  const catalog = useQuery(api.billing.getPlanCatalog, {});
  const setPlan = useMutation(api.billing.setPlan);

  const [busy, setBusy] = useState<Tier | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSelect(tier: Tier) {
    if (!businessId) return;
    if (
      !window.confirm(
        `Switch to ${tier}? (Stripe checkout is not wired yet — this updates the plan & resets the period.)`
      )
    )
      return;
    setBusy(tier);
    setErrorMsg(null);
    try {
      await setPlan({
        businessId: businessId as unknown as string,
        planTier: tier,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const usage = state?.usageThisPeriod;
  const credits = state?.credits;
  const used = credits
    ? credits.intelligenceCallsLimit - credits.intelligenceCallsRemaining
    : 0;
  const limit = credits?.intelligenceCallsLimit ?? 0;
  const usedPct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-4">
      {errorMsg ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Usage this period
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!state ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Intelligence calls
                  </span>
                  <span className="tabular-nums font-medium text-foreground">
                    {used.toLocaleString()} / {limit.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
              </div>
              <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <Row label="Calls" value={usage?.intelligenceCalls ?? 0} />
                <Row
                  label="Post-call analyses"
                  value={usage?.postCallAnalyses ?? 0}
                />
                <Row label="Connector syncs" value={usage?.connectorSyncs ?? 0} />
              </dl>
              <p className="text-[11px] text-muted-foreground">
                Period: {new Date(credits!.periodStart).toLocaleDateString()} —{" "}
                {new Date(credits!.periodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {!catalog ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {catalog.map((p) => {
                const tier = p.tier as Tier;
                const current = state?.planTier === tier;
                return (
                  <div
                    key={tier}
                    className={`flex flex-col gap-2 rounded-lg border px-3 py-3 ${
                      current
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold capitalize text-foreground">
                        {tier}
                      </h3>
                      {current ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Check className="size-3" /> Current
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs leading-snug text-muted-foreground">
                      {TIER_BLURB[tier]}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {p.monthlyUsd === 0 ? "Free" : `$${p.monthlyUsd}/mo`}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelect(tier)}
                      disabled={current || busy === tier}
                      className="mt-1 inline-flex items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                    >
                      <Sparkles className="size-3" />
                      {current ? "Active" : "Switch"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Stripe checkout will replace the in-app switch once
            STRIPE_SECRET_KEY and the webhook are configured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-md border border-border bg-background px-2 py-2">
      <dt className="text-[10px] uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
