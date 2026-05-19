import { Link } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import { getBackendBaseUrl } from "@/lib/backendUrl";
import { useTenant } from "@/tenant/TenantContext";
import { useCanvasIntegrationHealth } from "./context/IntegrationHealthContext";
import { CanvasSubpageHeader } from "./shell/CanvasSubpageHeader";
import { t } from "./i18n/canvas.en";

const STEPS = [
  { n: 1, title: "Onboard", path: "/onboard", body: "Create your workspace and paste your Beyond Presence agent ID." },
  { n: 2, title: "Workspace settings", path: "/canvas/settings", body: "Set business name, avatar agent ID, and optional HTTPS webhook URLs for CRM." },
  { n: 3, title: "Live advisor", path: "/canvas", body: "Run a visitor scenario — OpenAI scores intent and syncs your BP avatar opener." },
  { n: 4, title: "Live sessions", path: "/canvas/sessions", body: "Inspect visitors, intelligence, and transcripts in real time." },
  { n: 5, title: "Embed", path: "/canvas/embed", body: "Copy the script tag and add it to your site before </body>." },
  { n: 6, title: "Webhooks", path: "/canvas/webhooks", body: "Configure CRM fetch, push, and Slack HTTPS endpoints when automation is ready." },
] as const;

export function CanvasHelpPage() {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const health = useCanvasIntegrationHealth();
  const healthUrl = `${getBackendBaseUrl()}/api/health?probes=1`;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] space-y-8 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("help.title")} subtitle={t("help.subtitle")} />

        <section className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] text-muted-foreground break-all">
            Health: {healthUrl}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Local dev (three terminals): (1) <code className="rounded bg-muted px-1">cd backend && npx convex dev</code>{" "}
            (2) <code className="rounded bg-muted px-1">cd backend && npm run dev:clean</code> on port 3001 (3){" "}
            <code className="rounded bg-muted px-1">cd frontend && npm run dev</code> on :5173. Set OPENAI_API_KEY,
            BEYONDPRESENCE_API_KEY, and ELEVENLABS_API_KEY in backend/.env.local.
          </p>
          {health.resolvedBackendUrl ? (
            <p className="mt-2 font-mono text-[10px] text-muted-foreground break-all">
              Resolved API: {health.resolvedBackendUrl}
            </p>
          ) : null}
          {!health.loading && health.missingEnvVars.length > 0 ? (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs font-semibold text-foreground">{t("integrations.requiredEnvTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add these to <code className="rounded bg-muted px-1">backend/.env.local</code> or your host
                (Vercel → Backend project → Environment Variables). Never commit real secrets.
              </p>
              <ul className="mt-2 space-y-1 font-mono text-[11px]">
                {health.missingEnvVars.map((name) => (
                  <li key={name}>
                    <code className="rounded bg-muted px-1.5 py-0.5">{name}</code>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {!health.loading && health.setupWarnings.length > 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground">{t("integrations.warningsTitle")}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {health.setupWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {!health.loading && health.clerkPublishableMissing ? (
            <p className="mt-4 text-xs text-muted-foreground">{t("integrations.clerkMissing")}</p>
          ) : null}
        </section>

        <section className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4 rounded-lg border border-border bg-card p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {step.n}
              </span>
              <div>
                <Link
                  to={step.path === "/onboard" ? step.path : `${step.path}${qs}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {step.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleHelp className="size-4 shrink-0" />
          <span>
            See <code className="rounded bg-muted px-1 text-xs">backend/SETUP.md</code> for full environment
            setup.
          </span>
        </section>
      </div>
    </div>
  );
}
