import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/api";
import { showError, showSuccess } from "@/lib/toast";
import type { Id } from "@/convex/ids";
import type { DashboardStats, LiveSession, SessionDetailResult } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

const SESSIONS_PAGE_SIZE = 25;

export function useDashboardData(selectedVisitorId: Id<"visitors"> | null) {
  const {
    embedKey,
    business,
    memberships,
    signedIn,
    authReady,
    hasMembershipForEmbed,
  } = useTenant();

  const linkCurrentUser = useMutation(api.businessMembers.linkCurrentUser);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const memberBusinessId = memberships?.find(
    (m) => m.business?.embedKey === embedKey
  )?.business?._id as Id<"businesses"> | undefined;

  const useAuthQueries = hasMembershipForEmbed;
  const usePreviewQueries = authReady && !useAuthQueries;

  const authSessionsPaginated = usePaginatedQuery(
    api.intelligence.listLiveSessions,
    useAuthQueries && memberBusinessId
      ? { businessId: memberBusinessId }
      : "skip",
    { initialNumItems: SESSIONS_PAGE_SIZE }
  );

  const previewSessionsPaginated = usePaginatedQuery(
    api.intelligence.listLiveSessionsDemo,
    usePreviewQueries && embedKey ? { embedKey } : "skip",
    { initialNumItems: SESSIONS_PAGE_SIZE }
  );

  const activePagination = useAuthQueries ? authSessionsPaginated : previewSessionsPaginated;

  const sessions = activePagination.results as LiveSession[] | undefined;
  const sessionsStatus = activePagination.status;
  const canLoadMoreSessions = sessionsStatus === "CanLoadMore";
  const sessionsLoadingMore = sessionsStatus === "LoadingMore";
  const loadMoreSessions = activePagination.loadMore;

  const authDetail = useQuery(
    api.intelligence.getSessionDetail,
    useAuthQueries && selectedVisitorId ? { visitorId: selectedVisitorId } : "skip"
  ) as SessionDetailResult | null | undefined;

  const previewDetail = useQuery(
    api.intelligence.getSessionDetailDemo,
    usePreviewQueries && selectedVisitorId
      ? { embedKey, visitorId: selectedVisitorId }
      : "skip"
  ) as SessionDetailResult | null | undefined;

  const detail = useAuthQueries ? authDetail : previewDetail;

  const authStats = useQuery(
    api.intelligence.dashboardStats,
    useAuthQueries && memberBusinessId ? { businessId: memberBusinessId } : "skip"
  ) as DashboardStats | undefined;

  const previewStats = useQuery(
    api.intelligence.dashboardStatsDemo,
    usePreviewQueries && embedKey ? { embedKey } : "skip"
  ) as DashboardStats | undefined;

  const dashboardStats = useAuthQueries ? authStats : previewStats;

  const previewOnly =
    signedIn && authReady && !hasMembershipForEmbed && Boolean(business?._id);

  async function linkToCurrentBusiness() {
    if (!business?._id) return;
    setLinking(true);
    setLinkError(null);
    try {
      await linkCurrentUser({ businessId: business._id, role: "admin" });
      showSuccess("Workspace linked — full dashboard access enabled");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to link account";
      setLinkError(msg);
      showError(msg);
    } finally {
      setLinking(false);
    }
  }

  return {
    sessions,
    sessionsStatus,
    canLoadMoreSessions,
    sessionsLoadingMore,
    loadMoreSessions,
    detail,
    dashboardStats,
    linking,
    linkError,
    linkToCurrentBusiness,
    hasMembershipForEmbed,
    previewOnly,
    needsMembership:
      signedIn &&
      authReady &&
      memberships !== undefined &&
      !hasMembershipForEmbed &&
      Boolean(business?._id),
    sessionsError:
      business === null
        ? `No business found for embed key "${embedKey}". Run seed or complete onboarding.`
        : null,
  };
}
