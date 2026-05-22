import { useEffect } from "react";
import { useBpAgentId } from "@/hooks/useBpAgentId";
import { ensureCanvasAvatarInitialized } from "../lib/avatarSdk";
import { t } from "../i18n/canvas.en";

type Props = {
  embedKey: string;
};

/** Minimal avatar mount for Canvas dock (brand-theme). */
export function CanvasAvatarBoot({ embedKey }: Props) {
  const bpAgentId = useBpAgentId();

  useEffect(() => {
    const spinner = document.getElementById("canvas-avatar-spinner");
    const showLoading = () => {
      spinner?.classList.remove("hidden");
    };
    const onStart = () => showLoading();
    const onComplete = () => spinner?.classList.add("hidden");
    const onFallback = () => {
      spinner?.classList.add("hidden");
    };

    window.addEventListener("presenceiq:pipeline-start", onStart);
    window.addEventListener("presenceiq:pipeline-complete", onComplete);
    window.addEventListener("presenceiq:avatar-fallback", onFallback);

    let cancelled = false;
    void ensureCanvasAvatarInitialized(bpAgentId || undefined).catch((err) => {
      if (!cancelled) console.error("[PresenceIQ] Canvas avatar init failed", err);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("presenceiq:pipeline-start", onStart);
      window.removeEventListener("presenceiq:pipeline-complete", onComplete);
      window.removeEventListener("presenceiq:avatar-fallback", onFallback);
    };
  }, [embedKey, bpAgentId]);

  return (
    <div className="space-y-2">
      <div id="canvas-avatar-spinner" className="hidden text-sm text-primary">
        {t("avatar.loading")}
      </div>
      <div
        id="presenceiq-avatar-canvas"
        className="min-h-70 w-full rounded-md border border-dashed border-border bg-background/50"
        aria-live="polite"
      />
    </div>
  );
}
