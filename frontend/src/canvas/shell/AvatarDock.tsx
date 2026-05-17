import { X } from "lucide-react";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { CanvasAvatarBoot } from "../CanvasAvatarBoot";
import { useBpAgentId } from "@/hooks/useBpAgentId";
import { useTenant } from "@/tenant/TenantContext";
import { t } from "../i18n/canvas.en";
import { cn } from "@/lib/utils";

type PanelProps = {
  sessionActive: boolean;
  fallbackMessage: string | null;
  onClose?: () => void;
  showClose?: boolean;
};

export function AvatarPanelContent({
  sessionActive,
  fallbackMessage,
  onClose,
  showClose = false,
}: PanelProps) {
  const { embedKey } = useTenant();
  const bpAgentId = useBpAgentId();

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
            className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
            role="alert"
          >
            <p className="font-medium">{t("avatar.fallback")}</p>
            <p className="mt-1 text-amber-200/80">{fallbackMessage}</p>
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
          bpAgentId ? (
            <BeyondPresenceFrame
              agentId={bpAgentId}
              height={480}
              className="h-full min-h-[min(52vh,480px)] w-full rounded-lg"
              title={t("avatar.title")}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {t("avatar.noAgent")}
            </p>
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
        "hidden min-h-0 shrink-0 flex-col border-l border-border bg-card lg:flex",
        "w-[min(480px,42vw)] min-h-[min(72vh,640px)]"
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
