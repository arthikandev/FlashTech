import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import {
  getCategoryByIndustry,
  getCategoryByCode,
  type IndustryCategory,
} from "@/lib/categories/industryCategories";
import { enrichCategoryFromDb } from "@/hooks/useCategories";
import type { CategoryRecord } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

export function useBusinessCategory(): IndustryCategory {
  const { business, embedKey } = useTenant();

  const dbCategory = useQuery(
    api.categories.getForEmbedKey,
    embedKey ? { embedKey } : "skip"
  ) as { category: CategoryRecord } | null | undefined;

  return useMemo(() => {
    if (dbCategory?.category) {
      const enriched = enrichCategoryFromDb(dbCategory.category);
      if (enriched) return enriched;
    }

    if (business?.categoryCode) {
      return getCategoryByCode(business.categoryCode);
    }

    return getCategoryByIndustry(business?.industry);
  }, [dbCategory, business?.categoryCode, business?.industry]);
}
