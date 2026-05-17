import { Link } from "react-router-dom";
import { Workflow } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";
import { useBpAgentId } from "@/hooks/useBpAgentId";
import { useWebhookStatus } from "./hooks/useWebhookStatus";
import { CanvasSubpageHeader } from "./shell/CanvasSubpageHeader";
import { t } from "./i18n/canvas.en";

export function CanvasWorkflowSoon() {
  const { embedKey, business } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const bpAgentId = useBpAgentId();
  const { configuredCount, totalCount } = useWebhookStatus();

  const steps = [
    { label: "Beyond Presence agent", done: Boolean(bpAgentId || business?.avatarConfig?.bpAgentId) },
    { label: "Webhooks configured", done: configuredCount > 0 },
    { label: "Embed on your site", done: false },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("workflow.title")} subtitle={t("workflow.subtitle")} />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Workflow className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.25} />
            <p className="text-sm text-muted-foreground">{t("workflow.intro")}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Checklist
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-muted-foreground">
                <span
                  className={
                    s.done ? "size-2 rounded-full bg-emerald-500" : "size-2 rounded-full bg-muted-foreground/40"
                  }
                />
                {s.label}
              </li>
            ))}
            <li className="text-xs text-muted-foreground">
              {configuredCount}/{totalCount} webhook endpoints on workspace
            </li>
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
          </div>
        </div>
      </div>
    </div>
  );
}
