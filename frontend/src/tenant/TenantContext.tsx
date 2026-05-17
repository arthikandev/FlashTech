import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
import type { Id } from "@/convex/ids";
import type { Business } from "@/convex/types";
import {
  hasMembershipForEmbedKey,
  isValidEmbedKey,
  pickMemberEmbedKey,
  setLastEmbedKey,
  type MembershipRow,
} from "@/lib/postAuth";

/** Unsigned demo preview default only — not used for signed-in members. */
export const DEMO_PREVIEW_EMBED_KEY = "seylan-demo";

const DEMO_EMBED_OPTIONS = [
  { key: "seylan-demo", label: "Demo workspace" },
  { key: "cloudmetrics-demo", label: "Demo workspace B" },
  { key: "coral-demo", label: "Demo workspace C" },
] as const;

export function demoWorkspaceLabel(embedKey: string): string {
  return DEMO_EMBED_OPTIONS.find((o) => o.key === embedKey)?.label ?? "Demo workspace";
}

function resolveDemoEmbedKey(param: string | null): string {
  const key = param?.trim();
  if (key && isValidEmbedKey(key)) return key;
  return DEMO_PREVIEW_EMBED_KEY;
}

export type TenantContextValue = {
  authReady: boolean;
  signedIn: boolean;
  clerkEnabled: boolean;
  embedKey: string;
  embedOptions: Array<{ key: string; label: string }>;
  onEmbedKeyChange: (key: string) => void;
  business: Business | null | undefined;
  businessId: Id<"businesses"> | undefined;
  workspaceLabel: string;
  memberships: MembershipRow[] | undefined;
  hasMembershipForEmbed: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [embedKey, setEmbedKey] = useState(() =>
    resolveDemoEmbedKey(searchParams.get("embedKey"))
  );

  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();

  const authReady = !clerkEnabled || (clerkLoaded && !convexAuthLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  ) as MembershipRow[] | undefined;

  const memberEmbedKey = useMemo(
    () => pickMemberEmbedKey(memberships),
    [memberships]
  );

  useEffect(() => {
    const urlKey = searchParams.get("embedKey");

    if (signedIn && memberships !== undefined) {
      if (memberEmbedKey) {
        const useUrlKey =
          isValidEmbedKey(urlKey) &&
          hasMembershipForEmbedKey(memberships, urlKey!);
        const resolved = useUrlKey ? urlKey!.trim() : memberEmbedKey;
        setEmbedKey((prev) => (prev === resolved ? prev : resolved));
        if (!useUrlKey || urlKey !== resolved) {
          const next = new URLSearchParams(searchParams);
          next.set("embedKey", resolved);
          setSearchParams(next, { replace: true });
        }
        setLastEmbedKey(resolved);
        return;
      }
    }

    const fromUrl = resolveDemoEmbedKey(urlKey);
    setEmbedKey((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams, signedIn, memberships, memberEmbedKey, setSearchParams]);

  const business = useQuery(api.businesses.getByEmbedKey, { embedKey }) as
    | Business
    | null
    | undefined;

  const embedOptions = useMemo((): Array<{ key: string; label: string }> => {
    const fromMembers =
      memberships
        ?.filter((m) => m.business?.embedKey)
        .map((m) => ({
          key: m.business!.embedKey,
          label: m.business!.name,
        })) ?? [];
    if (fromMembers.length > 0) return fromMembers;
    if (signedIn) {
      if (business?.embedKey) {
        return [{ key: business.embedKey, label: business.name }];
      }
      if (isValidEmbedKey(embedKey)) {
        return [{ key: embedKey, label: demoWorkspaceLabel(embedKey) }];
      }
      return [];
    }
    return DEMO_EMBED_OPTIONS.map((o) => ({ key: o.key, label: o.label }));
  }, [memberships, signedIn, business?.embedKey, business?.name, embedKey]);

  const memberBusinessId = memberships?.find(
    (m) => m.business?.embedKey === embedKey
  )?.business?._id as Id<"businesses"> | undefined;

  const resolvedBusinessId = (memberBusinessId ?? business?._id) as
    | Id<"businesses">
    | undefined;

  const hasMembershipForEmbed = signedIn && Boolean(memberBusinessId);
  const businessId = resolvedBusinessId;

  const workspaceLabel = useMemo(() => {
    const match = embedOptions.find((o) => o.key === embedKey);
    return match?.label ?? business?.name ?? "Workspace";
  }, [embedOptions, embedKey, business?.name]);

  function handleEmbedKeyChange(key: string) {
    setEmbedKey(key);
    setLastEmbedKey(key);
    const next = new URLSearchParams(searchParams);
    next.set("embedKey", key);
    setSearchParams(next, { replace: true });
  }

  const value: TenantContextValue = {
    authReady,
    signedIn,
    clerkEnabled,
    embedKey,
    embedOptions,
    onEmbedKeyChange: handleEmbedKeyChange,
    business,
    businessId,
    workspaceLabel,
    memberships,
    hasMembershipForEmbed,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}
