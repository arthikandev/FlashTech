/** Team Convex dev deployment (see backend/.env.example). */
export const DEFAULT_CONVEX_URL = "https://adamant-puffin-769.convex.cloud";

export type RuntimeConfigFile = {
  backendUrl?: string;
  convexUrl?: string;
};

let fileConfig: RuntimeConfigFile | null = null;
let loadPromise: Promise<RuntimeConfigFile> | null = null;

export function loadRuntimeConfigFile(): Promise<RuntimeConfigFile> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const base = import.meta.env.BASE_URL ?? "/";
      const res = await fetch(`${base}runtime-config.json`, { cache: "no-store" });
      if (res.ok) {
        fileConfig = (await res.json()) as RuntimeConfigFile;
        return fileConfig;
      }
    } catch {
      /* ignore */
    }
    fileConfig = {};
    return fileConfig;
  })();

  return loadPromise;
}

export function getRuntimeConfigFile(): RuntimeConfigFile {
  return fileConfig ?? {};
}

export function resolveConvexUrl(): string | undefined {
  const fromEnv = import.meta.env.VITE_CONVEX_URL?.trim();
  if (fromEnv && fromEnv.includes(".convex.cloud")) return fromEnv;

  const fromFile = getRuntimeConfigFile().convexUrl?.trim();
  if (fromFile && fromFile.includes(".convex.cloud")) return fromFile;

  return DEFAULT_CONVEX_URL;
}
