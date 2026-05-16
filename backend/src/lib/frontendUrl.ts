/** Vite SPA (Person 3) — not this Next.js API server. */
const DEFAULT_LOCAL = "http://localhost:5173";
const DEFAULT_PROD = "https://frontend-nu-neon-44.vercel.app";

export function getFrontendUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    return DEFAULT_LOCAL;
  }

  return DEFAULT_PROD;
}

export function frontendPath(path: string): string {
  const base = getFrontendUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
