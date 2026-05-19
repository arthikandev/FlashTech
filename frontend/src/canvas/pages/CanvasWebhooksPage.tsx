import { Link } from "react-router-dom";
import { Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/tenant/TenantContext";
import { useWebhookStatus } from "./hooks/useWebhookStatus";
import { CanvasSubpageHeader } from "./shell/CanvasSubpageHeader";
import { t } from "./i18n/canvas.en";

export function CanvasWebhooksPage() {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const { endpoints, configuredCount, totalCount } = useWebhookStatus();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("webhooks.title")} subtitle={t("webhooks.subtitle")} />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Webhook className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.25} />
              <p className="text-sm text-muted-foreground">{t("webhooks.intro")}</p>
            </div>
            <Link
              to={`/canvas/settings${qs}&tab=webhooks`}
              className="inline-flex h-9 shrink-0 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              {t("webhooks.configure")}
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {configuredCount}/{totalCount} endpoints configured on this workspace
          </p>
          {endpoints.map((ep) => (
            <div
              key={ep.key}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{ep.label}</p>
                {ep.url ? (
                  <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{ep.url}</p>
                ) : null}
              </div>
              <span
                className={cn(
                  "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  ep.configured
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {ep.configured ? t("webhooks.configured") : t("webhooks.missing")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
