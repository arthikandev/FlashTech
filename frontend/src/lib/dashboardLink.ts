import { getBackendDashboardUrl } from "./backendUrl";

/** In-app route for marketing CTAs (sign in on your login page first). */
export function getDashboardEntryPath(): string {
  return "/login";
}

/** Full URL to friend's dashboard (footer, hero Dashboard link). */
export function getDashboardHref(): string {
  return getBackendDashboardUrl();
}
