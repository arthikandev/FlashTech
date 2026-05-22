import { useConvexAuth, useQuery } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
import type { Id } from "@/convex/ids";
import type { LiveSession } from "@/convex/types";

type Options = {
  businessId: Id<"businesses"> | undefined;
};

export function useAnalyticsSessions({ businessId }: Options) {
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const convexReady = !clerkEnabled || (isAuthenticated && !convexAuthLoading);

  const sessions = useQuery(
    api.intelligence.listAnalyticsSessions,
    convexReady && businessId ? { businessId } : "skip"
  ) as LiveSession[] | undefined;

  return { sessions, loading: sessions === undefined };
}
