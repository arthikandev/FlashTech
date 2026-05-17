import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Id } from "@/convex/ids";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTriggers } from "@/hooks/useTriggers";
import type { CategoryDefinition } from "@/lib/categories";
import { getCategoryByIndustry } from "@/lib/categories";
import { showError } from "@/lib/toast";
import { getSelectedIndustry, loadDraft } from "@/onboarding/storage";
import type { Industry } from "@/onboarding/types";
import { filterSessions, sortSessionsByIntent } from "@/lib/dashboard/sessionFilters";
import { useAiFeedEvents, type FeedEvent } from "../hooks/useAiFeedEvents";
import type { TriggerRow } from "@/hooks/useTriggers";
import type { DashboardStats, LiveSession, SessionDetailResult } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

export type DashboardContextValue = {
  authReady: boolean;
  signedIn: boolean;
  clerkEnabled: boolean;
  embedKey: string;
  embedOptions: Array<{ key: string; label: string }>;
  onEmbedKeyChange: (key: string) => void;
  business: ReturnType<typeof useTenant>["business"];
  businessId: Id<"businesses"> | undefined;
  sessions: LiveSession[] | undefined;
  dashboardStats: DashboardStats | undefined;
  filteredSessions: LiveSession[] | undefined;
  detail: SessionDetailResult | null | undefined;
  selectedVisitorId: Id<"visitors"> | null;
  setSelectedVisitorId: (id: Id<"visitors"> | null) => void;
  search: string;
  setSearch: (v: string) => void;
  feedEvents: FeedEvent[];
  pulseIds: Set<string>;
  triggers: TriggerRow[] | undefined;
  triggersLoading: boolean;
  workspaceLabel: string;
  linking: boolean;
  linkError: string | null;
  linkToCurrentBusiness: () => void;
  needsMembership: boolean;
  hasMembershipForEmbed: boolean;
  previewOnly: boolean;
  industry: Industry | "";
  category: CategoryDefinition | undefined;
  sessionsError: string | null;
  canLoadMoreSessions: boolean;
  sessionsLoadingMore: boolean;
  loadMoreSessions: (numItems: number) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const tenant = useTenant();
  const { embedKey } = tenant;

  const [selectedVisitorId, setSelectedVisitorId] = useState<Id<"visitors"> | null>(
    null
  );
  const [search, setSearch] = useState("");

  const {
    sessions,
    dashboardStats,
    detail,
    linking,
    linkError,
    linkToCurrentBusiness,
    needsMembership,
    previewOnly,
    sessionsError,
    canLoadMoreSessions,
    sessionsLoadingMore,
    loadMoreSessions,
    hasMembershipForEmbed,
  } = useDashboardData(selectedVisitorId);

  useEffect(() => {
    if (sessionsError) showError(sessionsError);
  }, [sessionsError]);

  const filteredSessions = useMemo(() => {
    if (!sessions) return undefined;
    return sortSessionsByIntent(filterSessions(sessions, search));
  }, [sessions, search]);

  const { events: feedEvents, pulseIds } = useAiFeedEvents(sessions, detail);
  const businessId = tenant.businessId;
  const { triggers, loading: triggersLoading } = useTriggers(businessId, {
    embedKey,
    useAuthQueries: hasMembershipForEmbed,
  });

  const industry = useMemo((): Industry | "" => {
    const fromBusiness = tenant.business?.industry as Industry | undefined;
    if (fromBusiness) return fromBusiness;
    return getSelectedIndustry() || loadDraft().industry || "";
  }, [tenant.business?.industry]);

  const category = useMemo(() => getCategoryByIndustry(industry), [industry]);

  const value: DashboardContextValue = {
    authReady: tenant.authReady,
    signedIn: tenant.signedIn,
    clerkEnabled: tenant.clerkEnabled,
    embedKey: tenant.embedKey,
    embedOptions: tenant.embedOptions,
    onEmbedKeyChange: (key) => {
      tenant.onEmbedKeyChange(key);
      setSelectedVisitorId(null);
    },
    business: tenant.business,
    businessId,
    sessions,
    dashboardStats,
    filteredSessions,
    detail,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    setSearch,
    feedEvents,
    pulseIds,
    triggers,
    triggersLoading,
    workspaceLabel: tenant.workspaceLabel,
    linking,
    linkError,
    linkToCurrentBusiness,
    needsMembership,
    hasMembershipForEmbed,
    previewOnly,
    industry,
    category,
    sessionsError,
    canLoadMoreSessions,
    sessionsLoadingMore,
    loadMoreSessions,
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return ctx;
}
