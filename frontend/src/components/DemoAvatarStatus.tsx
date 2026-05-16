import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

type PipelineStatus = "idle" | "loading" | "ready" | "error" | "fallback";

export function DemoAvatarStatus() {
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onStart = () => {
      setStatus("loading");
      setMessage("Running pre-conversation intelligence pipeline…");
    };
    const onComplete = () => {
      setStatus("ready");
      setMessage("Beyond Presence agent synced — avatar ready.");
    };
    const onError = (e: Event) => {
      const detail = (e as CustomEvent<{ error?: string }>).detail;
      setStatus("error");
      setMessage(detail?.error ?? "Pipeline failed");
    };
    const onFallback = (e: Event) => {
      const detail = (e as CustomEvent<{ reason?: string }>).detail;
      setStatus("fallback");
      setMessage(detail?.reason ?? "Avatar running in fallback mode");
    };

    window.addEventListener("presenceiq:pipeline-start", onStart);
    window.addEventListener("presenceiq:pipeline-complete", onComplete);
    window.addEventListener("presenceiq:pipeline-error", onError);
    window.addEventListener("presenceiq:avatar-fallback", onFallback);

    if (window.__piq_last?.visitorId) {
      setStatus("loading");
    }

    return () => {
      window.removeEventListener("presenceiq:pipeline-start", onStart);
      window.removeEventListener("presenceiq:pipeline-complete", onComplete);
      window.removeEventListener("presenceiq:pipeline-error", onError);
      window.removeEventListener("presenceiq:avatar-fallback", onFallback);
    };
  }, []);

  if (status === "idle") return null;

  return (
    <div className="rounded-xl border border-[#212121] bg-[#101010] p-4" role="status">
      {status === "loading" && (
        <LoadingState variant="inline" label={message ?? "Connecting avatar…"} />
      )}
      {status === "ready" && (
        <p className="text-sm text-emerald-400/90">{message}</p>
      )}
      {(status === "error" || status === "fallback") && (
        <EmptyState
          preset="error"
          title={status === "error" ? "Avatar pipeline error" : "Avatar fallback"}
          description={message ?? undefined}
        />
      )}
    </div>
  );
}
