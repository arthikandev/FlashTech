import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { resolveCategoryDashboardPath } from "@/lib/categoryDashboardLink";
import { canvasPathFromStorage, setLastEmbedKey } from "@/lib/postAuth";
import { OnboardingPage } from "./OnboardingPage";
import { getSelectedIndustry, isOnboardingComplete, loadDraft } from "./storage";

export function OnboardingRoute() {
  if (isOnboardingComplete()) {
    return <Navigate to={canvasPathFromStorage()} replace />;
  }

  const industry = loadDraft().industry || getSelectedIndustry();
  if (!industry) {
    return <Navigate to="/client/signup" replace />;
  }

  if (clerkEnabled) {
    return (
      <>
        <SignedOut>
          <Navigate to="/login" replace />
        </SignedOut>
        <SignedIn>
          <OnboardingGate />
        </SignedIn>
      </>
    );
  }

  return <OnboardingPage />;
}

function OnboardingGate() {
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

  if (!client) {
    return <Navigate to="/client/setup" replace />;
  }

  if (isOnboardingComplete() || client.onboardingComplete) {
    const key = business?.embedKey;
    if (key) {
      return (
        <Navigate
          to={resolveCategoryDashboardPath(key, client.categoryCode)}
          replace
        />
      );
    }
  }

  return <OnboardingPage />;
}
