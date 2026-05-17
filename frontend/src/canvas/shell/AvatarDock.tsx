import { Link } from "react-router-dom";
import { AlertCircle, Settings } from "lucide-react";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { CanvasAvatarBoot } from "../CanvasAvatarBoot";
import { useCanvasIntegrationHealth } from "../context/IntegrationHealthContext";
import { useBpAgentResolve } from "@/hooks/useBpAgentId";
import { useTenant } from "@/tenant/TenantContext";
import { t } from "../i18n/canvas.en";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type PanelProps = {
  sessionActive: boolean;
  fallbackMessage: string | null;
  onClose?: () => void;
  showClose?: boolean;
};

function AvatarSetupCard({ reason }: { reason: "noAgent" | "placeholder" | "bpKey" }) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}&tab=avatar`;
  const settingsTo = `/canvas/settings${qs}`;

  const copy =
    reason === "bpKey"
      ? t("avatar.setupBpKey")
      : reason === "placeholder"
        ? t("avatar.setupPlaceholder")
        : t("avatar.setupNoAgent");

  return (
    <div className="flex h-full min-h-[min(52vh,480px)] flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/35 bg-amber-500/5 px-6 py-8 text-center">
      <AlertCircle className="mb-3 size-8 text-amber-600 dark:text-amber-400" aria-hidden />
      <p className="text-sm font-medium text-foreground">{t("avatar.setupTitle")}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy}</p>
      <Link
        to={settingsTo}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Settings className="size-4" />
        {t("avatar.setupCta")}
      </Link>
      <p className="mt-4 text-[11px] text-muted-foreground">{t("avatar.setupHint")}</p>
    </div>
  );
}

export function AvatarPanelContent({
  sessionActive,
  fallbackMessage,
  onClose,
  showClose = false,
}: PanelProps) {
  const { embedKey } = useTenant();
  const { agentId, needsSetup } = useBpAgentResolve();
  const health = useCanvasIntegrationHealth();
  const bpConfigured = health.beyondPresence.ok;

  const showSetup = needsSetup || !agentId;
  const setupReason = !bpConfigured ? "bpKey" : needsSetup ? "placeholder" : "noAgent";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("avatar.title")}
          </p>
          {!sessionActive ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("avatar.previewHint")}</p>
          ) : null}
        </div>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close avatar panel"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden p-3">
        {fallbackMessage ? (
          <div
            className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200"
            role="alert"
          >
            <p className="font-medium">{t("avatar.fallback")}</p>
            <p className="mt-1 opacity-90">{fallbackMessage}</p>
          </div>
        ) : null}

        <div
          className={
            sessionActive
              ? "relative min-h-[min(52vh,480px)]"
              : "pointer-events-none absolute size-0 overflow-hidden opacity-0"
          }
          aria-hidden={!sessionActive}
        >
          <CanvasAvatarBoot embedKey={embedKey} />
        </div>

        {!sessionActive ? (
          showSetup ? (
            <AvatarSetupCard reason={setupReason} />
          ) : (
            <BeyondPresenceFrame
              agentId={agentId}
              height={480}
              className="h-full min-h-[min(52vh,480px)] w-full rounded-lg"
              title={t("avatar.title")}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

type DockProps = {
  open: boolean;
  onClose: () => void;
  sessionActive: boolean;
  fallbackMessage: string | null;
};

/** Desktop sidebar column — always visible on lg+. */
export function AvatarDock({ sessionActive, fallbackMessage }: Omit<DockProps, "open" | "onClose">) {
  return (
    <aside
      className={cn(
        "hidden min-h-0 shrink-0 flex-col border-l border-border bg-card/50 lg:flex",
        "w-[min(420px,38vw)]"
      )}
    >
      <AvatarPanelContent sessionActive={sessionActive} fallbackMessage={fallbackMessage} />
    </aside>
  );
}

/** Mobile slot: sits above the composer inside the chat column. */
export function AvatarMobileSlot({
  open,
  onClose,
  sessionActive,
  fallbackMessage,
}: DockProps) {
  if (!open) return null;
  return (
    <div className="flex max-h-[min(50vh,420px)] min-h-[220px] shrink-0 flex-col overflow-hidden border-t border-border bg-card">
      <AvatarPanelContent
        sessionActive={sessionActive}
        fallbackMessage={fallbackMessage}
        onClose={onClose}
        showClose
      />
    </div>
  );
}
