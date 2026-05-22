import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Activity, Sparkles, Users, Webhook, Zap } from "lucide-react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/convex/types";

type StatTile = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Activity;
};

function fmt(n: number | null | undefined, suffix = ""): string {
  if (n == null) return "—";
  return `${n}${suffix}`;
}

export function AdminOverview() {
  const { businessId, business, role } = useTenant();

  const stats = useQuery(
    api.intelligence.dashboardStats,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  ) as DashboardStats | undefined;

  const funnel = useQuery(
    api.categoryStats.getConversionFunnel,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  const applyDefaults = useMutation(api.industryDefaults.applyIndustryDefaults);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleApplyDefaults(overwrite: boolean) {
    if (!businessId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await applyDefaults({
        businessId: businessId as unknown as string,
        overwrite,
      });
      setFeedback(
        `Applied ${res.industry} defaults · ${res.triggersCreated} trigger(s) created${
          res.personaApplied ? " · persona refreshed" : ""
        }`
      );
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const tiles: StatTile[] = [
    {
      label: "Live visitors",
      value: fmt(stats?.liveVisitors),
      hint: "Currently fingerprinted on your sites",
      icon: Activity,
    },
    {
      label: "Conversations",
      value: fmt(stats?.conversations),
      hint: "Avatar-led sessions to date",
      icon: Users,
    },
    {
      label: "Hot-lead rate",
      value: fmt(stats?.hotLeadRate, "%"),
      hint: "Share of visitors at intent ≥ 75",
      icon: Zap,
    },
    {
      label: "Conversion",
      value: fmt(stats?.conversionRate, "%"),
      hint: "Converted sessions / total conversations",
      icon: Webhook,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.label}
                  </p>
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {t.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {t.hint}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Conversion funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-4">
            <FunnelStep label="Visitors" value={funnel?.visitors} />
            <FunnelStep label="Conversations" value={funnel?.conversations} />
            <FunnelStep label="Escalated" value={funnel?.escalated} />
            <FunnelStep label="Converted" value={funnel?.converted} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Industry defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Re-apply the persona, language, and default trigger rules for{" "}
            <span className="font-medium text-foreground">
              {business?.industry ?? "this industry"}
            </span>
            . Use overwrite to refresh persona even if you've customised it.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyDefaults(false)}
              disabled={busy || !businessId}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles className="size-3" /> Apply defaults
            </button>
            <button
              type="button"
              onClick={() => handleApplyDefaults(true)}
              disabled={busy || !businessId}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              Overwrite persona
            </button>
          </div>
          {feedback ? (
            <p className="text-xs text-muted-foreground">{feedback}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Workspace meta
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <dl className="grid gap-2 text-muted-foreground sm:grid-cols-2">
            <Row label="Industry" value={business?.industry ?? "—"} />
            <Row label="Plan tier" value="starter" />
            <Row label="Your role" value={role ?? "—"} />
            <Row
              label="Avatar agent"
              value={business?.avatarConfig?.bpAgentId ? "configured" : "not set"}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function FunnelStep({ label, value }: { readonly label: string; readonly value: number | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">
        {value ?? "—"}
      </p>
    </div>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
