import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getSelectedIndustry, isOnboardingComplete, loadDraft } from "@/onboarding/storage";
import { DashboardPage } from "./DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AvatarPage } from "./pages/AvatarPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SessionsPage } from "./pages/SessionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkflowPage } from "./pages/WorkflowPage";

export function ClientDashboardRoute() {
  const hasIndustry = Boolean(loadDraft().industry || getSelectedIndustry());

  if (!isOnboardingComplete() && !hasIndustry) {
    return <Navigate to="/client/signup" replace />;
  }

  return (
    <ProtectedRoute allowDemoPreview={false}>
      <Routes>
        <Route element={<DashboardPage />}>
          <Route index element={<OverviewPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="workflow" element={<WorkflowPage />} />
          <Route path="avatar" element={<AvatarPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
