import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  Fingerprint,
  Send,
  Sparkles,
  Webhook,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasIntegrationHealth } from "../context/IntegrationHealthContext";

const STORAGE_KEY = "piq-canvas-explainer-collapsed";

type StepCard = {
  icon: typeof Send;
  title: string;
  body: string;
  badge: string;
};

function OpenAiMissingBanner() {
  return (
    <output className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <p className="leading-snug">
        <span className="font-medium">OPENAI_API_KEY missing in backend.</span>{" "}
        The canvas will fall back to the scenario-aware heuristic — openers
        won't be GPT-4o quality until the key is set.
      </p>
    </output>
  );
}

const STEPS: StepCard[] = [
  {
    icon: Send,
    title: "You describe a visitor",
    body:
      "Type a scenario like \"trial day 6, viewed pricing twice\" — or hit focus and just type. We pre-fetch the visitor row while you write so nothing waits.",
    badge: "1 · Compose",
  },
  {
    icon: Fingerprint,
    title: "Visitor session opens",
    body:
      "A fingerprinted visitor is reused from the prewarm. The avatar SDK + BeyondPresence iframe were already warmed on page load.",
    badge: "2 · Connect",
  },
  {
    icon: Sparkles,
    title: "GPT-4o streams the opener",
    body:
      "We stream the personalised opener token-by-token (SSE), so the bubble fills as the AI writes — usually before BP has even spoken.",
    badge: "3 · Score",
  },
  {
    icon: Bot,
    title: "Avatar speaks (or TTS does)",
    body:
      "BeyondPresence delivers the personalised line. If BP isn't ready in 800 ms, OpenAI TTS speaks the same opener instantly so you never wait.",
    badge: "4 · Speak",
  },
  {
    icon: Webhook,
    title: "Automations fire",
    body:
      "If the score crosses your trigger threshold, the workspace pushes to Slack, your CRM, or n8n. The audit log records the run + the route taken.",
    badge: "5 · Automate",
  },
];

export function CanvasWorkflowExplainer() {
  const health = useCanvasIntegrationHealth();
  const initialCollapsed =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(STORAGE_KEY) === "1";
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);

  const openaiMissing = !health.loading && !health.openai.ok;

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (collapsed) {
    return (
      <div className="mx-auto mt-2 mb-4 max-w-2xl space-y-2 px-4 sm:px-6">
        {openaiMissing ? <OpenAiMissingBanner /> : null}
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="size-3" /> Show how this works
        </button>
      </div>
    );
  }

  return (
    <section
      className="mx-auto mt-2 mb-4 max-w-2xl space-y-3 rounded-xl border border-border bg-card/60 px-4 py-4 sm:mx-6 sm:px-5"
      aria-label="How the canvas works"
    >
      {openaiMissing ? <OpenAiMissingBanner /> : null}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            How this works
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-foreground">
            A scenario in, a personalised avatar opener out — under 2 seconds.
          </h2>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Hide explainer"
        >
          <X className="size-3.5" />
        </button>
      </header>

      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className={cn(
                "flex items-start gap-2 rounded-lg border border-border/60 bg-background px-3 py-2",
                i === STEPS.length - 1 && STEPS.length % 2 === 1
                  ? "sm:col-span-2"
                  : ""
              )}
            >
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {step.badge}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
        Speed tips: the avatar iframe pre-warms when you open the canvas, and
        steps 2 and 3 run in parallel. Cached intent scores stay valid for 60
        seconds so re-running the same scenario is instant.
      </p>
    </section>
  );
}
