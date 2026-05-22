import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";
import type { DashboardStats, LiveSession, SessionDetailResult } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

const SESSIONS_PAGE_SIZE = 25;

export function useDashboardData(selectedVisitorId: Id<"visitors"> | null) {
  const { embedKey, memberships, hasMembershipForEmbed } = useTenant();

  const memberBusinessId = memberships?.find(
    (m) => m.business?.embedKey === embedKey
  )?.business?._id as Id<"businesses"> | undefined;

  const useAuthQueries = hasMembershipForEmbed;

  const sessionsPaginated = usePaginatedQuery(
    api.intelligence.listLiveSessions,
    useAuthQueries && memberBusinessId ? { businessId: memberBusinessId } : "skip",
    { initialNumItems: SESSIONS_PAGE_SIZE }
  );

  const sessions = sessionsPaginated.results as LiveSession[] | undefined;
  const sessionsStatus = sessionsPaginated.status;
  const canLoadMoreSessions = sessionsStatus === "CanLoadMore";
  const sessionsLoadingMore = sessionsStatus === "LoadingMore";
  const loadMoreSessions = sessionsPaginated.loadMore;

  const detail = useQuery(
    api.intelligence.getSessionDetail,
    useAuthQueries && selectedVisitorId ? { visitorId: selectedVisitorId } : "skip"
  ) as SessionDetailResult | null | undefined;

  const dashboardStats = useQuery(
    api.intelligence.dashboardStats,
    useAuthQueries && memberBusinessId ? { businessId: memberBusinessId } : "skip"
  ) as DashboardStats | undefined;

  return {
    sessions,
    sessionsStatus,
    canLoadMoreSessions,
    sessionsLoadingMore,
    loadMoreSessions,
    detail,
    dashboardStats,
    hasMembershipForEmbed,
  };
}
