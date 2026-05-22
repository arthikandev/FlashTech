import { loadRuntimeConfigFile } from "./runtimeConfig";

/** Default matches friend's local backend on setup-clerk (port 3001). */
const DEFAULT_BACKEND_URL = "http://localhost:3001";
const PROBE_TIMEOUT_MS = 2500;

let resolvedBase: string | null = null;
let cachedWorkingBase: string | null = null;
let initPromise: Promise<string> | null = null;
let resolvePromise: Promise<string> | null = null;

function envBackendUrl(): string | undefined {
  const raw = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return raw?.trim() || undefined;
}

/** Dev-only: Vite proxies /app → friend's backend without env vars. */
function devProxyBase(): string {
  return `${window.location.origin}/app`;
}

function isLocalDirectBackend(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" && (u.port === "3001" || u.port === "3000");
  } catch {
    return url.includes("localhost:3001") || url.includes("localhost:3000");
  }
}

async function probeHealth(base: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(`${base.replace(/\/$/, "")}/api/health`, {
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

function candidateBases(): string[] {
  const fromEnv = envBackendUrl()?.replace(/\/$/, "");
  const out: string[] = [];

  if (fromEnv) out.push(fromEnv);
  if (import.meta.env.DEV) {
    if (!fromEnv || isLocalDirectBackend(fromEnv)) {
      out.push(devProxyBase());
    }
  }
  if (!fromEnv && !import.meta.env.DEV) {
    if (resolvedBase) out.push(resolvedBase);
  }
  if (!out.length) out.push(DEFAULT_BACKEND_URL);

  return [...new Set(out)];
}

/** Pick first reachable backend (dev: tries direct localhost then Vite /app proxy). */
export async function resolveBackendBaseUrl(): Promise<string> {
  if (cachedWorkingBase) return cachedWorkingBase;
  if (resolvePromise) return resolvePromise;

  resolvePromise = (async () => {
    for (const base of candidateBases()) {
      if (await probeHealth(base)) {
        cachedWorkingBase = base;
        resolvedBase = base;
        return base;
      }
    }
    const fallback = candidateBases()[0] ?? DEFAULT_BACKEND_URL;
    resolvedBase = fallback;
    return fallback;
  })();

  try {
    return await resolvePromise;
  } finally {
    resolvePromise = null;
  }
}

export function getBackendBaseUrl(): string {
  if (cachedWorkingBase) return cachedWorkingBase;
  const fromEnv = envBackendUrl();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV && !fromEnv) {
    return devProxyBase();
  }
  if (resolvedBase) return resolvedBase;
  return DEFAULT_BACKEND_URL;
}

export function getBackendDashboardUrl(): string {
  return `${getBackendBaseUrl()}/dashboard`;
}

/** Load runtime-config.json (production) so friend can keep deploying backend independently. */
export function initBackendUrl(): Promise<string> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const fromEnv = envBackendUrl();
    if (fromEnv) {
      const base = fromEnv.replace(/\/$/, "");
      if (import.meta.env.DEV && isLocalDirectBackend(base)) {
        return resolveBackendBaseUrl();
      }
      resolvedBase = base;
      return base;
    }

    if (import.meta.env.DEV) {
      return resolveBackendBaseUrl();
    }

    const data = await loadRuntimeConfigFile();
    const url = data.backendUrl?.trim();
    if (url) {
      resolvedBase = url.replace(/\/$/, "");
      return resolvedBase;
    }

    resolvedBase = DEFAULT_BACKEND_URL;
    return resolvedBase;
  })();

  return initPromise;
}

/** Load shared runtime-config (backend + convex URLs). */
export function initRuntimeConfig(): Promise<void> {
  return initBackendUrl().then(() => undefined);
}

export async function goToBackendDashboard(): Promise<void> {
  await initBackendUrl();
  window.location.assign(getBackendDashboardUrl());
}

/** Force re-probe after backend restart (integration status bar retry). */
export function invalidateBackendBaseUrl(): void {
  cachedWorkingBase = null;
  resolvePromise = null;
}
