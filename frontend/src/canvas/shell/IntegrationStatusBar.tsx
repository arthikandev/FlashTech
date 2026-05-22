import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/tenant/TenantContext";
import type { IntegrationHealth, IntegrationProbe } from "../hooks/useIntegrationHealth";
import { t } from "../i18n/canvas.en";

function ProbePill({ probe, embedKey }: { probe: IntegrationProbe; embedKey: string }) {
  const q = `embedKey=${encodeURIComponent(embedKey)}`;
  const href = probe.fixHref
    ? probe.fixHref.includes("?")
      ? `${probe.fixHref}&${q}`
      : `${probe.fixHref}?${q}`
    : undefined;

  const className = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
    probe.ok
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
  );

  const inner = (
    <>
      <span
        className={cn("size-1.5 rounded-full", probe.ok ? "bg-emerald-500" : "bg-amber-500")}
        aria-hidden
      />
      {probe.label}
    </>
  );

  if (!probe.ok && href) {
    return (
      <Link to={href} className={className} title={probe.reason ?? t("integrations.missing")}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={className} title={probe.ok ? t("integrations.connected") : probe.reason}>
      {inner}
    </span>
  );
}

type Props = {
  health: IntegrationHealth;
  /** When true, warnings collapse into a single expandable row (saves vertical space). */
  compact?: boolean;
};

export function IntegrationStatusBar({ health, compact = false }: Props) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const ek = embedKey;
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (health.loading) {
    return (
      <p className="px-1 text-[10px] text-muted-foreground">{t("integrations.checking")}</p>
    );
  }

  const coreProbes = [health.convex, health.openai, health.beyondPresence];
  const allLive = health.canRunLive;
  const optionalOnlyGap =
    !health.elevenLabs.ok &&
    health.missingEnvVars.length === 0 &&
    health.optionalEnvVars.length > 0;
  const hasDetails =
    Boolean(health.error) ||
    health.missingEnvVars.length > 0 ||
    (!allLive && health.setupWarnings.length > 0) ||
    health.clerkPublishableMissing ||
    (optionalOnlyGap && !compact);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {allLive
            ? health.elevenLabs.ok
              ? t("integrations.allLive")
              : t("integrations.coreLive")
            : `${health.connectedCount}/${health.totalCount} ${t("integrations.partial")}`}
        </span>
        {coreProbes.map((p) => (
          <ProbePill key={p.label} probe={p} embedKey={ek} />
        ))}
        <ProbePill
          key={health.elevenLabs.label}
          probe={{
            ...health.elevenLabs,
            label: allLive && !health.elevenLabs.ok ? `${health.elevenLabs.label} (opt.)` : health.elevenLabs.label,
          }}
          embedKey={ek}
        />
        {!allLive ? (
          <Link
            to={`/canvas/help${qs}`}
            className="text-[10px] font-medium text-primary hover:underline"
          >
            {t("integrations.fixSetup")}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={health.refresh}
          className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          aria-label={t("integrations.retry")}
        >
          <RefreshCw className="size-3" />
          {t("integrations.retry")}
        </button>
        {compact && hasDetails ? (
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            aria-expanded={detailsOpen}
          >
            {t("integrations.showDetails")}
            <ChevronDown
              className={cn("size-3 transition-transform", detailsOpen && "rotate-180")}
            />
          </button>
        ) : null}
      </div>

      {(!compact || detailsOpen) && hasDetails ? (
        <div className="space-y-1.5">
          {health.error ? (
            <p className="text-[10px] text-amber-700 dark:text-amber-300">{health.error}</p>
          ) : null}
          {health.setupWarnings.length > 0 ? (
            <p className="text-[10px] text-muted-foreground">
              {health.setupWarnings[0]}
              {health.setupWarnings.length > 1
                ? ` (+${health.setupWarnings.length - 1} more)`
                : ""}
            </p>
          ) : null}
          {!compact && health.missingEnvVars.length > 0 ? (
            <div className="rounded-md border border-amber-500/25 bg-amber-500/5 px-2 py-1.5">
              <p className="text-[10px] font-medium text-amber-900 dark:text-amber-100">
                {t("integrations.requiredEnvTitle")}
              </p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {health.missingEnvVars.map((name) => (
                  <li key={name}>
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                      {name}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {!compact && health.optionalEnvVars.length > 0 ? (
            <div className="rounded-md border border-border bg-muted/30 px-2 py-1.5">
              <p className="text-[10px] font-medium text-muted-foreground">
                {t("integrations.optionalEnvTitle")}
              </p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {health.optionalEnvVars.map((name) => (
                  <li key={name}>
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                      {name}
                    </code>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Add to <code className="font-mono">backend/.env.local</code>, then restart{" "}
                <code className="font-mono">npm run dev</code> in backend.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
