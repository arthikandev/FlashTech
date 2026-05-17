import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { api, clerkEnabled } from "@/convex/api";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { resolvePostAuthPath, type MembershipRow } from "@/lib/postAuth";

export function PostAuthRedirect() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const { loading: clientLoading, client, business } = useCurrentClient();

  const authReady = !clerkEnabled || (clerkLoaded && !convexLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  ) as MembershipRow[] | undefined;

  const clientRow =
    client && business ? { client, business } : client === null ? { client: null, business: null } : undefined;

  if (!clerkEnabled) {
    return <Navigate to="/onboard" replace />;
  }

  if (!authReady || !clerkLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm">Loading your workspace…</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (signedIn && memberships === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm">Loading your workspace…</span>
      </div>
    );
  }

  if (clientRow === undefined || clientLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm">Loading your workspace…</span>
      </div>
    );
  }

  return <Navigate to={resolvePostAuthPath(memberships, clientRow)} replace />;
}
