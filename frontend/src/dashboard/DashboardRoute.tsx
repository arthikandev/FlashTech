import { Navigate } from "react-router-dom";
import { isOnboardingComplete } from "@/onboarding/storage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { DashboardPage } from "./DashboardPage";

export function DashboardRoute() {
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboard" replace />;
  }

  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
