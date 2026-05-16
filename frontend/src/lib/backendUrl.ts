/** Friend's Next.js app (backend Vercel project). */
export function getBackendBaseUrl(): string {
  const raw = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return (raw?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export function getBackendDashboardUrl(): string {
  return `${getBackendBaseUrl()}/dashboard`;
}

export function goToBackendDashboard(): void {
  window.location.assign(getBackendDashboardUrl());
}
