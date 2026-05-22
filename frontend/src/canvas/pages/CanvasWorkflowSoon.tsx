import { Link } from "react-router-dom";
import { ArrowRight, Workflow } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";
import { useBpAgentId } from "@/hooks/useBpAgentId";
import { useCanvasIntegrationHealth } from "../context/IntegrationHealthContext";
import { useWebhookStatus } from "../hooks/useWebhookStatus";
import { CanvasSubpageHeader } from "../shell/CanvasSubpageHeader";
import {
  canvasWorkflowProgress,
  computeCanvasWorkflowSteps,
} from "../lib/canvasWorkflow";
import { t } from "../i18n/canvas.en";
import { cn } from "@/lib/utils";

export function CanvasWorkflowSoon() {
  const { embedKey, businessId, business } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const bpAgentId = useBpAgentId();
  const health = useCanvasIntegrationHealth();
  const { configuredCount, totalCount, endpoints } = useWebhookStatus();

  const steps = computeCanvasWorkflowSteps({
    hasBusinessId: Boolean(businessId),
    intelligenceReady: health.canRunIntelligence,
    liveStackReady: health.canRunLive,
    elevenLabsOk: health.elevenLabs.ok,
    bpAgentConfigured: Boolean(bpAgentId || business?.avatarConfig?.bpAgentId),
    webhooksConfigured: configuredCount,
    webhooksTotal: totalCount,
  });

  const progress = canvasWorkflowProgress(steps);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[800px] space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("workflow.title")} subtitle={t("workflow.subtitle")} />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Workflow className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.25} />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("workflow.intro")}</p>
              <p className="text-xs text-muted-foreground">
                {progress.requiredDone}/{progress.requiredTotal} required steps · {progress.done}/
                {progress.total} including optional voice
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("workflow.pipelineTitle")}
          </p>
          <ol className="mt-4 space-y-0">
            {steps.map((step, index) => {
              const href = step.href?.(qs);
              const isLast = index === steps.length - 1;
              return (
                <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {!isLast ? (
                    <span
                      className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border"
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                      step.done
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {step.done ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      {step.optional ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {t("workflow.optional")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                    {href ? (
                      <Link
                        to={href}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {t("workflow.openStep")}
                        <ArrowRight className="size-3" />
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("workflow.webhooksTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {endpoints.map((e) => (
              <li key={e.key} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{e.label}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    e.configured ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {e.configured ? t("webhooks.configured") : t("webhooks.missing")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/canvas/webhooks${qs}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              {t("workflow.ctaWebhooks")}
            </Link>
            <Link
              to={`/canvas/embed${qs}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              {t("workflow.ctaEmbed")}
            </Link>
            <Link
              to={`/canvas${qs}`}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("workflow.ctaAdvisor")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
