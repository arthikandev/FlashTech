import { Bot, BrainCircuit, Percent, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { computeKpiSnapshot, type KpiSnapshot } from "@/lib/dashboard/metrics";
import type { CategoryDefinition } from "@/lib/categories";
import type { DashboardStats, LiveSession } from "@/convex/types";

type Props = {
  sessions: LiveSession[] | undefined;
  stats?: DashboardStats | undefined;
  category?: CategoryDefinition;
};

const KPI_META: Array<{
  key: keyof KpiSnapshot;
  label: string;
  icon: typeof Users;
  format: (v: number | null) => string;
}> = [
  {
    key: "liveVisitors",
    label: "Live visitors",
    icon: Users,
    format: (v) => (v != null ? v.toLocaleString() : "—"),
  },
  {
    key: "conversations",
    label: "AI conversations",
    icon: Bot,
    format: (v) => (v != null ? v.toLocaleString() : "—"),
  },
  {
    key: "hotLeadRate",
    label: "Hot lead rate",
    icon: TrendingUp,
    format: (v) => (v != null ? `${v}%` : "—"),
  },
  {
    key: "avgIntent",
    label: "Avg intent score",
    icon: BrainCircuit,
    format: (v) => (v != null ? `${v}/100` : "—"),
  },
  {
    key: "conversionRate",
    label: "Conversion rate",
    icon: Percent,
    format: (v) => (v != null ? `${v}%` : "—"),
  },
];

function resolveSnapshot(
  stats: DashboardStats | undefined,
  sessions: LiveSession[] | undefined
): KpiSnapshot | undefined {
  if (stats) return stats;
  if (sessions === undefined) return undefined;
  return computeKpiSnapshot(sessions);
}

function resolveKpiMeta(category?: CategoryDefinition) {
  if (!category?.mockKpis.length) return KPI_META;
  return KPI_META.map((meta, i) => {
    const override = category.mockKpis[i];
    if (!override) return meta;
    return { ...meta, label: override.label };
  });
}

export function KpiGrid({ sessions, stats, category }: Props) {
  const snapshot = resolveSnapshot(stats, sessions);
  const kpiMeta = resolveKpiMeta(category);

  if (snapshot === undefined) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpiMeta.map((m) => (
          <Card key={m.key}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (snapshot.liveVisitors === 0 && !sessions?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No visitor activity yet</EmptyTitle>
          <EmptyDescription>
            Embed PresenceIQ on your site or open a demo to see live KPIs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {kpiMeta.map((m, i) => {
        const Icon = m.icon;
        const raw = snapshot[m.key];
        const display = m.format(raw);
        const hint = category?.mockKpis[i]?.hint;
        return (
          <Card key={m.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{display}</p>
              {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
