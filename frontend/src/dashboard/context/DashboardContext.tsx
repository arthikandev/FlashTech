import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import type { Id } from "@/convex/ids";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTriggers } from "@/hooks/useTriggers";
import { showError } from "@/lib/toast";
import { useAiFeedEvents, type FeedEvent } from "../hooks/useAiFeedEvents";
import type { TriggerRow } from "@/hooks/useTriggers";
import type { Business, LiveSession, SessionDetailResult } from "@/convex/types";

const DEFAULT_EMBED_KEY = "seylan-demo";

function resolveEmbedKey(param: string | null): string {
  const key = param?.trim();
  if (key && /^[a-z0-9-]+$/.test(key)) return key;
  return DEFAULT_EMBED_KEY;
}

export type DashboardContextValue = {
  authReady: boolean;
  signedIn: boolean;
  clerkEnabled: boolean;
  embedKey: string;
  embedOptions: Array<{ key: string; label: string }>;
  onEmbedKeyChange: (key: string) => void;
  business: Business | null | undefined;
  businessId: Id<"businesses"> | undefined;
  sessions: LiveSession[] | undefined;
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
  previewOnly: boolean;
  sessionsError: string | null;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [embedKey, setEmbedKey] = useState(() =>
    resolveEmbedKey(searchParams.get("embedKey"))
  );
  const [selectedVisitorId, setSelectedVisitorId] = useState<Id<"visitors"> | null>(
    null
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fromUrl = resolveEmbedKey(searchParams.get("embedKey"));
    setEmbedKey((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams]);

  const {
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
    needsMembership,
    previewOnly,
    sessionsError,
  } = useDashboardData(embedKey, selectedVisitorId);

  useEffect(() => {
    if (sessionsError) showError(sessionsError);
  }, [sessionsError]);

  const { events: feedEvents, pulseIds } = useAiFeedEvents(sessions, detail);
  const businessId = business?._id;
  const { triggers, loading: triggersLoading } = useTriggers(businessId);

  const workspaceLabel = useMemo(() => {
    const match = embedOptions.find((o) => o.key === embedKey);
    return match?.label ?? business?.name ?? "Workspace";
  }, [embedOptions, embedKey, business?.name]);

  function handleEmbedKeyChange(key: string) {
    setEmbedKey(key);
    setSelectedVisitorId(null);
    const next = new URLSearchParams(searchParams);
    next.set("embedKey", key);
    setSearchParams(next, { replace: true });
  }

  const value: DashboardContextValue = {
    authReady,
    signedIn,
    clerkEnabled,
    embedKey,
    embedOptions,
    onEmbedKeyChange: handleEmbedKeyChange,
    business,
    businessId,
    sessions,
    detail,
    selectedVisitorId,
    setSelectedVisitorId,
    search,
    setSearch,
    feedEvents,
    pulseIds,
    triggers,
    triggersLoading,
    workspaceLabel,
    linking,
    linkError,
    linkToCurrentBusiness,
    needsMembership,
    previewOnly,
    sessionsError,
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
