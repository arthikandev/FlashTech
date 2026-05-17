import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
import type { CategoryCode } from "@/lib/categories/industryCategories";

export type ClientRecord = {
  _id: string;
  businessName: string;
  categoryCode: CategoryCode;
  businessId: string;
  onboardingComplete: boolean;
  verification: { status: string; badgeLabel?: string };
  subscription: { tier: string };
};

export function useCurrentClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const skip = !clerkEnabled || isLoading || !isAuthenticated;

  const row = useQuery(api.clients.getForCurrentUser, skip ? "skip" : {}) as
    | {
        client: ClientRecord;
        business: { _id: string; embedKey: string; name: string; industry: string; categoryCode?: CategoryCode };
        category: { name: string; tag: string } | null;
      }
    | null
    | undefined;

  return {
    loading: !skip && row === undefined,
    client: row?.client ?? null,
    business: row?.business ?? null,
    category: row?.category ?? null,
    hasClient: Boolean(row?.client),
  };
}
