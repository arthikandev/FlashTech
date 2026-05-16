import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardRouter } from "@/dashboards/DashboardRouter";
import { loadDraft } from "@/onboarding/storage";
import { isOnboardingComplete } from "@/onboarding/storage";

export function ClientDashboardRoute() {
  if (!isOnboardingComplete()) {
    const draft = loadDraft();
    if (!draft.industry) {
      return <Navigate to="/client/signup" replace />;
    }
    return <Navigate to="/onboard" replace />;
  }

  return (
    <ProtectedRoute allowDemoPreview={false}>
      <DashboardRouter />
    </ProtectedRoute>
  );
}
