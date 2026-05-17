import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";
import type { IntegrationHealth } from "../hooks/useIntegrationHealth";
import { t } from "../i18n/canvas.en";

const STORAGE_KEY = "piq-canvas-started";

type Props = {
  health: IntegrationHealth;
};

const STEPS: Array<{ labelKey: keyof typeof import("../i18n/canvas.en").canvasMessages; href: (qs: string) => string }> = [
  { labelKey: "gettingStarted.step1", href: () => "/onboard" },
  { labelKey: "gettingStarted.step2", href: (qs) => `/canvas/help${qs}` },
  { labelKey: "gettingStarted.step3", href: (qs) => `/canvas${qs}` },
  { labelKey: "gettingStarted.step4", href: (qs) => `/canvas/embed${qs}` },
];

export function CanvasGettingStarted({ health }: Props) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;

  if (health.loading || health.canRunIntelligence) return null;
  if (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
    return null;
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    window.location.reload();
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:mx-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{t("gettingStarted.title")}</p>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label={t("gettingStarted.dismiss")}
        >
          <X className="size-4" />
        </button>
      </div>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        {STEPS.map((step, i) => (
          <li key={step.labelKey}>
            <Link to={step.href(qs)} className="text-foreground hover:text-primary hover:underline">
              {i + 1}. {t(step.labelKey)}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        to={`/canvas/help${qs}`}
        className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
      >
        {t("composer.setupLink")} →
      </Link>
    </div>
  );
}
