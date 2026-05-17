import type { CategoryCode } from "@/lib/categories/industryCategories";

/** Category-specific dashboard entry (template chosen by categoryCode in shell). */
export function resolveCategoryDashboardPath(
  embedKey: string,
  _categoryCode?: CategoryCode | string | null
): string {
  return `/canvas/dashboard?embedKey=${encodeURIComponent(embedKey)}`;
}
