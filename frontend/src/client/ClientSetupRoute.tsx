import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { isOnboardingComplete } from "@/onboarding/storage";
import { resolveCategoryDashboardPath } from "@/lib/categoryDashboardLink";
import { setLastEmbedKey } from "@/lib/postAuth";
import { ClientSetupPage } from "./ClientSetupPage";

export function ClientSetupRoute() {
  if (!clerkEnabled) {
    return <Navigate to="/onboard" replace />;
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/register" replace />
      </SignedOut>
      <SignedIn>
        <ClientSetupGate />
      </SignedIn>
    </>
  );
}

function ClientSetupGate() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { loading, client, business } = useCurrentClient();

  useEffect(() => {
    if (business?.embedKey) setLastEmbedKey(business.embedKey);
  }, [business?.embedKey]);

  if (isLoading || !isAuthenticated || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (client && business) {
    if (isOnboardingComplete() || client.onboardingComplete) {
      return (
        <Navigate
          to={resolveCategoryDashboardPath(business.embedKey, client.categoryCode)}
          replace
        />
      );
    }
    return <Navigate to="/onboard" replace />;
  }

  return <ClientSetupPage />;
}
