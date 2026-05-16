/** Default matches friend's local backend on setup-clerk (port 3001). */
const DEFAULT_BACKEND_URL = "http://localhost:3001";

let resolvedBase: string | null = null;
let initPromise: Promise<string> | null = null;

function envBackendUrl(): string | undefined {
  const raw = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return raw?.trim() || undefined;
}

/** Dev-only: Vite proxies /app → friend's backend without env vars. */
function devProxyBase(): string | null {
  if (import.meta.env.DEV && !envBackendUrl()) {
    return `${window.location.origin}/app`;
  }
  return null;
}

export function getBackendBaseUrl(): string {
  const fromEnv = envBackendUrl();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proxy = devProxyBase();
  if (proxy) return proxy;
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
      resolvedBase = fromEnv.replace(/\/$/, "");
      return resolvedBase;
    }

    const proxy = devProxyBase();
    if (proxy) {
      resolvedBase = proxy;
      return resolvedBase;
    }

    try {
      const base = import.meta.env.BASE_URL ?? "/";
      const res = await fetch(`${base}runtime-config.json`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { backendUrl?: string };
        const url = data.backendUrl?.trim();
        if (url) {
          resolvedBase = url.replace(/\/$/, "");
          return resolvedBase;
        }
      }
    } catch {
      /* use default */
    }

    resolvedBase = DEFAULT_BACKEND_URL;
    return resolvedBase;
  })();

  return initPromise;
}

export async function goToBackendDashboard(): Promise<void> {
  await initBackendUrl();
  window.location.assign(getBackendDashboardUrl());
}
