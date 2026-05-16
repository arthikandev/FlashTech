import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { goToBackendDashboard } from "@/lib/backendUrl";
import { OnboardingPage } from "./OnboardingPage";
import { isOnboardingComplete } from "./storage";

function OnboardingCompleteRedirect() {
  useEffect(() => {
    void goToBackendDashboard();
  }, []);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background text-muted-foreground text-sm">
      Opening dashboard…
    </div>
  );
}

export function OnboardingRoute() {
  if (isOnboardingComplete()) {
    return <OnboardingCompleteRedirect />;
  }

  if (clerkEnabled) {
    return (
      <>
        <SignedOut>
          <Navigate to="/login" replace />
        </SignedOut>
        <SignedIn>
          <OnboardingPage />
        </SignedIn>
      </>
    );
  }

  return <OnboardingPage />;
}
