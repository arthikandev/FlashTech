import { useCallback, useEffect, useState } from "react";
import {
  getBackendBaseUrl,
  invalidateBackendBaseUrl,
  resolveBackendBaseUrl,
} from "@/lib/backendUrl";
import { invalidateCanvasAvatarInit } from "../lib/avatarSdk";
import { OPTIONAL_BACKEND_ENV_VARS } from "../canvasWorkflow";

const OPTIONAL_ENV_SET = new Set<string>(OPTIONAL_BACKEND_ENV_VARS);

export type IntegrationProbe = {
  ok: boolean;
  label: string;
  reason?: string;
  fixHref?: string;
};

export type IntegrationHealth = {
  convex: IntegrationProbe;
  openai: IntegrationProbe;
  beyondPresence: IntegrationProbe;
  elevenLabs: IntegrationProbe;
  loading: boolean;
  error?: string;
  /** Resolved API base used for health (after dev proxy fallback). */
  resolvedBackendUrl?: string;
  /** Required env vars from GET /api/health `missing` */
  missingEnvVars: string[];
  /** Optional integrations (probe-only; not in backend `missing`) */
  optionalEnvVars: string[];
  /** Non-fatal setup gaps from GET /api/health `warnings` (automation webhooks, BP key, secrets, etc.) */
  setupWarnings: string[];
  /** Build-time: dashboard sign-in publishable key absent from Vite bundle */
  clerkPublishableMissing: boolean;
  /** Convex + OpenAI — enough to run `/api/pipeline` intelligence */
  canRunIntelligence: boolean;
  /** Convex + OpenAI + Beyond Presence API — full avatar sync stack */
  canRunLive: boolean;
  connectedCount: number;
  totalCount: number;
  refresh: () => void;
};

type ProbeDetail = { ok: boolean; reason?: string };
type HealthBody = {
  probes?: Record<string, boolean>;
  probeDetails?: Record<string, ProbeDetail>;
  checks?: {
    convex?: string;
    openai?: string;
    beyondPresence?: string;
  };
  missing?: string[];
  warnings?: string[];
};

/** If backend lists these in `missing`, tie them to probe tooltips */
const PROBE_ENV_VARS: Record<
  keyof Pick<IntegrationHealth, "convex" | "openai" | "beyondPresence" | "elevenLabs">,
  string[]
> = {
  convex: ["NEXT_PUBLIC_CONVEX_URL"],
  openai: ["OPENAI_API_KEY"],
  beyondPresence: ["BEYONDPRESENCE_API_KEY"],
  elevenLabs: ["ELEVENLABS_API_KEY"],
};

function envVarsForProbe(
  key: keyof typeof PROBE_ENV_VARS,
  missing?: string[]
): string[] {
  const names = PROBE_ENV_VARS[key];
  if (!missing?.length) return [];
  return missing.filter((m) => names.includes(m));
}

const PROBE_META: Array<{
  key: keyof Pick<IntegrationHealth, "convex" | "openai" | "beyondPresence" | "elevenLabs">;
  label: string;
  checkKey?: keyof NonNullable<HealthBody["checks"]>;
  fixHref: string;
  requiredForLive: boolean;
}> = [
  { key: "convex", label: "Convex", checkKey: "convex", fixHref: "/canvas/help", requiredForLive: true },
  { key: "openai", label: "OpenAI", checkKey: "openai", fixHref: "/canvas/help", requiredForLive: true },
  {
    key: "beyondPresence",
    label: "Beyond Presence",
    checkKey: "beyondPresence",
    fixHref: "/canvas/settings?tab=avatar",
    requiredForLive: true,
  },
  {
    key: "elevenLabs",
    label: "ElevenLabs",
    fixHref: "/canvas/help",
    requiredForLive: false,
  },
];

function buildProbe(
  meta: (typeof PROBE_META)[number],
  probes?: Record<string, boolean>,
  probeDetails?: Record<string, ProbeDetail>,
  checks?: HealthBody["checks"],
  missing?: string[]
): IntegrationProbe {
  const detail = probeDetails?.[meta.key];
  const fromProbe = probes?.[meta.key];
  const fromCheck =
    meta.checkKey && checks?.[meta.checkKey]
      ? checks[meta.checkKey] === "configured"
      : undefined;

  const ok = fromProbe ?? fromCheck ?? false;
  const hinted = envVarsForProbe(meta.key, missing);
  const reason =
    detail?.reason ??
    (!ok && hinted.length > 0
      ? `Set ${hinted.join(", ")} on the backend (see backend/.env.example)`
      : undefined) ??
    (ok ? undefined : meta.checkKey && checks?.[meta.checkKey] === "missing"
      ? `${meta.label} not configured on backend`
      : "Unreachable — is the backend running?");

  return {
    ok,
    label: meta.label,
    reason,
    fixHref: meta.fixHref,
  };
}

function buildHealth(
  body: HealthBody
): Omit<IntegrationHealth, "loading" | "refresh" | "clerkPublishableMissing"> {
  const missingRaw = body.missing ?? [];
  const missing = missingRaw.filter((name) => !OPTIONAL_ENV_SET.has(name));
  const convex = buildProbe(PROBE_META[0], body.probes, body.probeDetails, body.checks, missingRaw);
  const openai = buildProbe(PROBE_META[1], body.probes, body.probeDetails, body.checks, missing);
  const beyondPresence = buildProbe(PROBE_META[2], body.probes, body.probeDetails, body.checks, missing);
  const elevenLabs = buildProbe(PROBE_META[3], body.probes, body.probeDetails, body.checks, missing);

  const optionalEnvVars: string[] = [];
  if (!elevenLabs.ok) {
    optionalEnvVars.push("ELEVENLABS_API_KEY");
  }

  const requiredLive = [convex, openai, beyondPresence];
  const requiredIntelligence = [convex, openai];
  const coreProbes = requiredLive;
  const liveStackReady = requiredLive.every((p) => p.ok);

  const setupWarnings = (body.warnings ?? []).filter(
    (w) => !/elevenlabs/i.test(w) || !liveStackReady
  );

  return {
    convex,
    openai,
    beyondPresence,
    elevenLabs,
    missingEnvVars: [...missing],
    optionalEnvVars,
    setupWarnings,
    canRunIntelligence: requiredIntelligence.every((p) => p.ok),
    canRunLive: liveStackReady,
    connectedCount: coreProbes.filter((p) => p.ok).length,
    totalCount: coreProbes.length,
  };
}

const EMPTY = buildHealth({});

export function useIntegrationHealth(): IntegrationHealth {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(() => EMPTY);
  const [error, setError] = useState<string | undefined>();
  const [resolvedBackendUrl, setResolvedBackendUrl] = useState<string | undefined>();
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    invalidateBackendBaseUrl();
    invalidateCanvasAvatarInit();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const base = await resolveBackendBaseUrl();
        if (cancelled) return;
        setResolvedBackendUrl(base);

        const res = await fetch(`${base}/api/health?probes=1`);
        const body = (await res.json()) as HealthBody;
        if (cancelled) return;
        if (!res.ok) {
          setError(`Health check failed (${res.status})`);
          setData(buildHealth(body));
        } else {
          setData(buildHealth(body));
        }
      } catch {
        if (!cancelled) {
          setError("Cannot reach backend — check VITE_BACKEND_URL and npm run dev in backend/");
          setData(
            buildHealth({
              checks: {
                convex: "missing",
                openai: "missing",
                beyondPresence: "missing",
              },
            })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const clerkPublishableMissing = !(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined)?.trim();

  return {
    ...data,
    loading,
    error,
    resolvedBackendUrl: resolvedBackendUrl ?? getBackendBaseUrl(),
    refresh,
    clerkPublishableMissing,
  };
}
