import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, clerkEnabled } from "@/convex/api";
import { isOnboardingComplete } from "@/onboarding/storage";
import type { MembershipRow } from "@/lib/postAuth";
import { DashboardPage } from "./DashboardPage";

export function DashboardRoute() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();

  const authReady = !clerkEnabled || (clerkLoaded && !convexAuthLoading);
  const signedIn = clerkEnabled && Boolean(isSignedIn && isAuthenticated);

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  ) as MembershipRow[] | undefined;

  if (clerkEnabled && authReady && isSignedIn) {
    if (!isAuthenticated || convexAuthLoading || memberships === undefined) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading workspace…
        </div>
      );
    }
    const hasMember = memberships.some((m) => m.business?.embedKey);
    if (!hasMember && !isOnboardingComplete()) {
      return <Navigate to="/onboard" replace />;
    }
    if (!hasMember) {
      return <Navigate to="/onboard" replace />;
    }
  } else if (!clerkEnabled && !isOnboardingComplete()) {
    return <Navigate to="/onboard" replace />;
  }

  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
