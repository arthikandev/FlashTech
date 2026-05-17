import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { OnboardingPage } from "./OnboardingPage";
import { getSelectedIndustry, isOnboardingComplete, loadDraft } from "./storage";

export function OnboardingRoute() {
  if (isOnboardingComplete()) {
    return <Navigate to="/dashboard" replace />;
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
          <OnboardingPage />
        </SignedIn>
      </>
    );
  }

  return <OnboardingPage />;
}
