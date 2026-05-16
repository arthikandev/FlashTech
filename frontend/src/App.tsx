import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { DashboardRoute } from "./dashboard/DashboardRoute";
import { OverviewPage } from "./dashboard/pages/OverviewPage";
import { SessionsPage } from "./dashboard/pages/SessionsPage";
import { AnalyticsPage } from "./dashboard/pages/AnalyticsPage";
import { WorkflowPage } from "./dashboard/pages/WorkflowPage";
import { AvatarPage } from "./dashboard/pages/AvatarPage";
import { SettingsPage } from "./dashboard/pages/SettingsPage";
import { SlackMock } from "./dashboard/SlackMock";
import { SeylanPage } from "./demos/SeylanPage";
import { CloudMetricsPage } from "./demos/CloudMetricsPage";
import { CoralPage } from "./demos/CoralPage";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { LandingPage } from "./landing/LandingPage";
import { BusinessWizard } from "./onboarding/BusinessWizard";
import { PitchDeck } from "./pitch/PitchDeck";
import { PresentPage } from "./pages/PresentPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="deck" element={<PitchDeck />} />
          <Route path="slack" element={<SlackMock />} />
          <Route path="present" element={<PresentPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="dashboard" element={<DashboardRoute />}>
            <Route index element={<OverviewPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="avatar" element={<AvatarPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="onboard" element={<BusinessWizard />} />
            <Route path="demos/seylan" element={<SeylanPage />} />
            <Route path="demos/cloudmetrics" element={<CloudMetricsPage />} />
            <Route path="demos/coral" element={<CoralPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
