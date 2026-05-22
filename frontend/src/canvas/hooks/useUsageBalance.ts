import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";

export type UsageBalance = {
  remaining: number;
  limit: number;
  planTier: string;
  model: string;
  periodEnd: number;
};

export function useUsageBalance(businessId: Id<"businesses"> | undefined) {
  const balance = useQuery(
    api.usage.getBalance,
    businessId ? { businessId } : "skip"
  ) as UsageBalance | null | undefined;

  const creditsExhausted =
    balance != null && balance.limit > 0 && balance.remaining <= 0;

  return { balance, creditsExhausted };
}
