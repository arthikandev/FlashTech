import { Navigate } from "react-router-dom";
import { isOnboardingComplete } from "@/onboarding/storage";
import { ConvexAppProvider } from "../lib/convex";
import { DashboardPage } from "./DashboardPage";

export function DashboardRoute() {
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <ConvexAppProvider>
      <DashboardPage />
    </ConvexAppProvider>
  );
}
