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

export type TenantRole = "admin" | "viewer" | null;

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
  role: TenantRole;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [embedKey, setEmbedKey] = useState("");

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
    if (!signedIn || memberships === undefined) return;

    const urlKey = searchParams.get("embedKey");
    if (!memberEmbedKey) {
      if (embedKey !== "") setEmbedKey("");
      return;
    }

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
  }, [searchParams, signedIn, memberships, memberEmbedKey, embedKey, setSearchParams]);

  const business = useQuery(
    api.businesses.getByEmbedKey,
    embedKey ? { embedKey } : "skip"
  ) as Business | null | undefined;

  const embedOptions = useMemo((): Array<{ key: string; label: string }> => {
    return (
      memberships
        ?.filter((m) => m.business?.embedKey)
        .map((m) => ({
          key: m.business!.embedKey,
          label: m.business!.name,
        })) ?? []
    );
  }, [memberships]);

  const matchingMembership = memberships?.find(
    (m) => m.business?.embedKey === embedKey
  );
  const memberBusinessId = matchingMembership?.business?._id as
    | Id<"businesses">
    | undefined;
  const role: TenantRole = matchingMembership?.membership?.role ?? null;

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
    role,
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
