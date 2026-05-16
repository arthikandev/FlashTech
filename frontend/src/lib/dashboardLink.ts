/** In-app route for marketing CTAs (sign in on your login page first). */
export function getDashboardEntryPath(): string {
  return "/login";
}

/** In-app dashboard path after sign-in (category-specific UI). */
export function getDashboardHref(): string {
  return "/dashboard";
}
