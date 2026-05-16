import { useConvexAuth, useQuery } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
import type { Id } from "@/convex/ids";
import type { LiveSession } from "@/convex/types";

type Options = {
  embedKey: string;
  businessId: Id<"businesses"> | undefined;
  useAuthQueries: boolean;
};

export function useAnalyticsSessions({
  embedKey,
  businessId,
  useAuthQueries,
}: Options) {
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const convexReady = !clerkEnabled || (isAuthenticated && !convexAuthLoading);
  const useAuth = useAuthQueries && convexReady;

  const authSessions = useQuery(
    api.intelligence.listAnalyticsSessions,
    useAuth && businessId ? { businessId } : "skip"
  ) as LiveSession[] | undefined;

  const previewSessions = useQuery(
    api.intelligence.listAnalyticsSessionsDemo,
    !useAuth && embedKey ? { embedKey } : "skip"
  ) as LiveSession[] | undefined;

  const sessions = useAuth ? authSessions : previewSessions;

  return { sessions, loading: sessions === undefined };
}
