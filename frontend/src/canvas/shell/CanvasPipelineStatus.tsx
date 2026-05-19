import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineRunMeta } from "../hooks/useComposerPipeline";

type Phase = "idle" | "connecting" | "scoring" | "speaking" | "done" | "error";

type Step = {
  phase: Exclude<Phase, "idle" | "error">;
  label: string;
  hint: string;
};

const STEPS: Step[] = [
  { phase: "connecting", label: "Connect", hint: "Opening visitor session" },
  { phase: "scoring", label: "Score", hint: "Reading intent with GPT-4o" },
  { phase: "speaking", label: "Speak", hint: "Avatar delivering the opener" },
  { phase: "done", label: "Ready", hint: "Live and listening" },
];

type Props = {
  readonly sending: boolean;
  readonly sessionActive: boolean;
  readonly errorMessage: string | null;
  readonly fallbackMessage: string | null;
  readonly lastRun?: PipelineRunMeta | null;
};

function routePill(route: PipelineRunMeta["route"]) {
  if (route === "live") {
    return {
      label: "live",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    };
  }
  if (route === "cached") {
    return {
      label: "cached",
      className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    };
  }
  return {
    label: "heuristic",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  };
}

function routeExplainer(meta: PipelineRunMeta): string {
  const ms = meta.pipelineMs != null ? `${meta.pipelineMs} ms` : "—";
  if (meta.route === "live") {
    if (meta.bpSynced) {
      return meta.bpPartial
        ? `BP greeting · system prompt left to bey.chat · ${ms}`
        : `BP avatar spoke · ${ms}`;
    }
    return `Scored live · BP not synced · ${ms}`;
  }
  if (meta.route === "cached") return `Cached intent · ${ms}`;
  return `Heuristic · OpenAI timed out or unset · ${ms}`;
}

/**
 * Real-time status of the avatar pipeline.
 * Subscribes to the same window events as the SDK so users see exactly
 * which step they are waiting on instead of one blanket spinner.
 */
export function CanvasPipelineStatus({
  sending,
  sessionActive,
  errorMessage,
  fallbackMessage,
  lastRun,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const startedAtRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    function onStart() {
      startedAtRef.current = performance.now();
      setElapsedMs(0);
      setPhase("scoring");
    }
    function onComplete() {
      setPhase("speaking");
      // Settle to "done" after the avatar has time to begin speech.
      window.setTimeout(() => setPhase("done"), 600);
    }
    function onError() {
      setPhase("error");
    }
    function onFallback() {
      setPhase("error");
    }

    window.addEventListener("presenceiq:pipeline-start", onStart);
    window.addEventListener("presenceiq:pipeline-complete", onComplete);
    window.addEventListener("presenceiq:pipeline-error", onError);
    window.addEventListener("presenceiq:avatar-fallback", onFallback);

    return () => {
      window.removeEventListener("presenceiq:pipeline-start", onStart);
      window.removeEventListener("presenceiq:pipeline-complete", onComplete);
      window.removeEventListener("presenceiq:pipeline-error", onError);
      window.removeEventListener("presenceiq:avatar-fallback", onFallback);
    };
  }, []);

  // When the composer flips `sending` on, we are between click and
  // pipeline-start (operator-session fetch + avatar init). Reflect that
  // as "connecting" so the user always sees motion.
  useEffect(() => {
    if (sending && (phase === "idle" || phase === "done" || phase === "error")) {
      startedAtRef.current = performance.now();
      setElapsedMs(0);
      setPhase("connecting");
    }
  }, [sending, phase]);

  // Tick a coarse elapsed timer while a step is in flight.
  useEffect(() => {
    if (phase === "idle" || phase === "done" || phase === "error") return;
    const id = window.setInterval(() => {
      if (startedAtRef.current != null) {
        setElapsedMs(performance.now() - startedAtRef.current);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  // Auto-clear errors when a new send begins (covered above) and after
  // a few seconds when idle, so the bar doesn't stick on a stale error.
  useEffect(() => {
    if (phase !== "error") return;
    const id = window.setTimeout(() => {
      if (!sending) setPhase("idle");
    }, 6000);
    return () => window.clearTimeout(id);
  }, [phase, sending]);

  if (phase === "idle" && !sessionActive) return null;
  if (phase === "idle" && sessionActive) {
    // Idle but session is live — keep the green "Ready" pill visible so
    // users know the avatar is warm.
    const pill = lastRun ? routePill(lastRun.route) : null;
    return (
      <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3" aria-hidden />
          <span>Avatar live · listening</span>
        </div>
        {pill ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              pill.className
            )}
          >
            {pill.label}
          </span>
        ) : null}
        {lastRun ? (
          <span className="text-[10px] text-muted-foreground">
            {routeExplainer(lastRun)}
          </span>
        ) : null}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.phase === phase);
  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div
      className="mx-auto mt-2 max-w-2xl rounded-lg border border-border bg-card/60 px-3 py-2"
      role="status"
      aria-live="polite"
    >
      {phase === "error" ? (
        <div className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium">Pipeline interrupted</p>
            <p className="truncate text-xs opacity-90">
              {errorMessage ?? fallbackMessage ?? "Retry in a moment."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <ol className="flex items-center gap-1">
            {STEPS.map((step, i) => {
              const isActive = i === currentIndex;
              const isDone = i < currentIndex || phase === "done";
              return (
                <li key={step.phase} className="flex flex-1 items-center gap-1">
                  <span
                    className={cn(
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-emerald-500/80 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : isActive ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px]",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 ? (
                    <span className="mx-1 flex-1 border-t border-dashed border-border" />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="truncate">
              {phase === "done" && lastRun
                ? routeExplainer(lastRun)
                : STEPS[currentIndex]?.hint ?? "Preparing…"}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              {phase === "done" && lastRun ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                    routePill(lastRun.route).className
                  )}
                >
                  {routePill(lastRun.route).label}
                </span>
              ) : null}
              <span className="tabular-nums">{seconds}s</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
