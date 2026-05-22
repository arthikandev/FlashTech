/** In-app route for marketing CTAs (sign in on your login page first). */
export function getCanvasEntryPath(): string {
  return "/login";
}

/** Primary product surface after auth. */
export function getCanvasHref(): string {
  return "/canvas";
}

/** @deprecated Use getCanvasHref */
export function getDashboardHref(): string {
  return getCanvasHref();
}

/** @deprecated Use getCanvasEntryPath */
export function getDashboardEntryPath(): string {
  return getCanvasEntryPath();
}
