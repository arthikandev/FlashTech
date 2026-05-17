import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { CategoryRecord, CategoryWithClients } from "@/convex/types";
import { INDUSTRY_CATEGORIES } from "@/lib/categories/industryCategories";

/** Load categories from Convex; seed once if the table is empty. */
export function useCategories() {
  const seedCategories = useMutation(api.categories.seedCategories);
  const categories = useQuery(api.categories.list) as CategoryRecord[] | undefined;

  useEffect(() => {
    if (categories !== undefined && categories.length === 0) {
      void seedCategories({});
    }
  }, [categories, seedCategories]);

  return categories;
}

export function useCategoriesWithClients() {
  const seedCategories = useMutation(api.categories.seedCategories);
  const rows = useQuery(api.categories.listWithClientCounts) as
    | CategoryWithClients[]
    | undefined;

  useEffect(() => {
    if (rows !== undefined && rows.length === 0) {
      void seedCategories({});
    }
  }, [rows, seedCategories]);

  return rows;
}

/** Merge DB category row with static UI metadata (icons, demo links). */
export function enrichCategoryFromDb(row: CategoryRecord) {
  const ui = INDUSTRY_CATEGORIES.find(
    (c) => c.code === row.code || c.industryKey === row.industryKey
  );
  return ui ? { ...ui, ...row, industryKey: ui.industryKey } : null;
}
