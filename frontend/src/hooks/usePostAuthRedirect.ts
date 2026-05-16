import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, clerkEnabled } from "@/convex/api";
import { resolvePostAuthPath, type MembershipRow } from "@/lib/postAuth";

export function usePostAuthRedirect(enabled = true) {
  const navigate = useNavigate();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const didRun = useRef(false);

  const authReady = !clerkEnabled || (clerkLoaded && !convexLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn && enabled ? {} : "skip"
  ) as MembershipRow[] | undefined;

  useEffect(() => {
    if (!enabled || !authReady || !signedIn || memberships === undefined) return;
    if (didRun.current) return;
    didRun.current = true;
    navigate(resolvePostAuthPath(memberships), { replace: true });
  }, [enabled, authReady, signedIn, memberships, navigate]);

  return { authReady, signedIn, memberships, pending: signedIn && memberships === undefined };
}
