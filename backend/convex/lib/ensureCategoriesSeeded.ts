import type { MutationCtx } from "../_generated/server";
import { CATEGORY_SEED_ROWS } from "./categoriesData";

/** Idempotent upsert of the six platform categories (shared by seed mutation and createAccount). */
export async function ensurePlatformCategoriesSeeded(
  ctx: Pick<MutationCtx, "db">
): Promise<{ inserted: number; updated: number }> {
  const now = Date.now();
  let inserted = 0;
  let updated = 0;

  for (const row of CATEGORY_SEED_ROWS) {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_code", (q) => q.eq("code", row.code))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        industryKey: row.industryKey,
        name: row.name,
        tag: row.tag,
        coreMetric: row.coreMetric,
        dashboardFocus: row.dashboardFocus,
        exampleClients: row.exampleClients,
        sortOrder: row.sortOrder,
        updatedAt: now,
      });
      updated += 1;
    } else {
      await ctx.db.insert("categories", {
        code: row.code,
        industryKey: row.industryKey,
        name: row.name,
        tag: row.tag,
        coreMetric: row.coreMetric,
        dashboardFocus: row.dashboardFocus,
        exampleClients: row.exampleClients,
        sortOrder: row.sortOrder,
        updatedAt: now,
      });
      inserted += 1;
    }
  }

  return { inserted, updated };
}
