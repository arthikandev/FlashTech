import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
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
};

export function IntegrationStatusBar({ health }: Props) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const ek = embedKey;

  if (health.loading) {
    return (
      <p className="px-1 text-[10px] text-muted-foreground">{t("integrations.checking")}</p>
    );
  }

  const probes = [health.convex, health.openai, health.beyondPresence, health.elevenLabs];
  const allLive = health.canRunLive;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {allLive
          ? t("integrations.allLive")
          : `${health.connectedCount}/${health.totalCount} ${t("integrations.partial")}`}
      </span>
      {probes.map((p) => (
        <ProbePill key={p.label} probe={p} embedKey={ek} />
      ))}
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
      {health.error ? (
        <div className="w-full space-y-1">
          <p className="text-[10px] text-amber-700 dark:text-amber-300">{health.error}</p>
          <p className="text-[10px] text-muted-foreground">{t("integrations.backendUnreachableHint")}</p>
          {health.resolvedBackendUrl ? (
            <p className="font-mono text-[10px] text-muted-foreground break-all">
              {t("integrations.resolvedBackend")}: {health.resolvedBackendUrl}
            </p>
          ) : null}
        </div>
      ) : null}
      {health.missingEnvVars.length > 0 ? (
        <div className="w-full rounded-md border border-amber-500/25 bg-amber-500/5 px-2 py-1.5">
          <p className="text-[10px] font-medium text-amber-900 dark:text-amber-100">
            {t("integrations.requiredEnvTitle")}
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {health.missingEnvVars.map((name) => (
              <li key={name}>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{name}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {health.setupWarnings.length > 0 ? (
        <div className="w-full max-h-28 overflow-y-auto rounded-md border border-border bg-muted/40 px-2 py-1.5">
          <p className="text-[10px] font-medium text-muted-foreground">{t("integrations.warningsTitle")}</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[10px] text-muted-foreground">
            {health.setupWarnings.slice(0, 6).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          {health.setupWarnings.length > 6 ? (
            <p className="mt-1 text-[10px] text-muted-foreground">
              +{health.setupWarnings.length - 6} {t("integrations.warningsTruncated")}
            </p>
          ) : null}
        </div>
      ) : null}
      {health.clerkPublishableMissing ? (
        <p className="w-full text-[10px] text-muted-foreground">{t("integrations.clerkMissing")}</p>
      ) : null}
    </div>
  );
}
