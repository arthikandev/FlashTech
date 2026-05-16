import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api, clerkEnabled } from "@/convex/api";
import { showError, showSuccess } from "@/lib/toast";
import type { Id } from "@/convex/ids";
import type { Business, LiveSession, SessionDetailResult } from "@/convex/types";

const DEFAULT_EMBED_KEYS = [
  { key: "seylan-demo", label: "Seylan Bank" },
  { key: "cloudmetrics-demo", label: "CloudMetrics" },
  { key: "coral-demo", label: "Coral Resort" },
] as const;

export function useDashboardData(embedKey: string, selectedVisitorId: Id<"visitors"> | null) {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
  const linkCurrentUser = useMutation(api.businessMembers.linkCurrentUser);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const authReady = !clerkEnabled || (clerkLoaded && !convexAuthLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const business = useQuery(api.businesses.getByEmbedKey, { embedKey }) as
    | Business
    | null
    | undefined;

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  ) as Array<{ membership: unknown; business: Business | null }> | undefined;

  const membershipBusinesses = useMemo(() => {
    if (!memberships?.length) return [];
    return memberships
      .filter((m) => m.business?.embedKey)
      .map((m) => ({
        key: m.business!.embedKey,
        label: m.business!.name,
      }));
  }, [memberships]);

  const embedOptions = useMemo((): Array<{ key: string; label: string }> => {
    const fromMembers = membershipBusinesses;
    if (fromMembers.length > 0) return fromMembers;
    const opts: Array<{ key: string; label: string }> = DEFAULT_EMBED_KEYS.map(
      (o) => ({ key: o.key, label: o.label })
    );
    if (business?.embedKey && !opts.some((o) => o.key === business.embedKey)) {
      opts.unshift({ key: business.embedKey, label: business.name });
    }
    return opts;
  }, [membershipBusinesses, business?.embedKey, business?.name]);

  const memberBusinessId = memberships?.find(
    (m) => m.business?.embedKey === embedKey
  )?.business?._id;

  const hasMembershipForEmbed = signedIn && Boolean(memberBusinessId);

  /** Authenticated queries only when user is a member of the selected workspace. */
  const useAuthQueries = hasMembershipForEmbed;

  /** Preview mode: unsigned, or signed in but not yet linked to this tenant. */
  const usePreviewQueries = authReady && !useAuthQueries;

  const authSessions = useQuery(
    api.intelligence.listLiveSessions,
    useAuthQueries && memberBusinessId
      ? { businessId: memberBusinessId }
      : "skip"
  ) as LiveSession[] | undefined;

  const previewSessions = useQuery(
    api.intelligence.listLiveSessionsDemo,
    usePreviewQueries && embedKey ? { embedKey } : "skip"
  ) as LiveSession[] | undefined;

  const sessions = useAuthQueries ? authSessions : previewSessions;

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
    authReady,
    signedIn,
    clerkEnabled,
    business,
    sessions,
    detail,
    embedOptions,
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
