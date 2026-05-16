import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
import { getCategoryByIndustry } from "@/lib/categories";
import type { MembershipRow } from "@/lib/postAuth";

export function useClientMembership() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();

  const authReady = !clerkEnabled || (clerkLoaded && !convexAuthLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  ) as MembershipRow[] | undefined;

  const primary =
    memberships?.find((m) => m.business?.embedKey) ?? memberships?.[0] ?? null;
  const business = primary?.business ?? null;
  const category = getCategoryByIndustry(business?.industry);

  return {
    authReady,
    signedIn,
    memberships,
    primary,
    business,
    category,
    loading: signedIn && memberships === undefined,
  };
}
