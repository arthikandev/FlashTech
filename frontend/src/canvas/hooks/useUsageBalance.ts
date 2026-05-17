import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";
import { useTenant } from "@/tenant/TenantContext";

export type UsageBalance = {
  remaining: number;
  limit: number;
  planTier: string;
  model: string;
  periodEnd: number;
};

export function useUsageBalance(businessId: Id<"businesses"> | undefined) {
  const { embedKey, hasMembershipForEmbed } = useTenant();

  const authBalance = useQuery(
    api.usage.getBalance,
    businessId && hasMembershipForEmbed ? { businessId } : "skip"
  ) as UsageBalance | null | undefined;

  const demoBalance = useQuery(
    api.usage.getBalanceByEmbedKey,
    !hasMembershipForEmbed && embedKey ? { embedKey } : "skip"
  ) as UsageBalance | null | undefined;

  const balance = hasMembershipForEmbed ? authBalance : demoBalance;

  const creditsExhausted =
    balance != null && balance.limit > 0 && balance.remaining <= 0;

  return { balance, creditsExhausted };
}
