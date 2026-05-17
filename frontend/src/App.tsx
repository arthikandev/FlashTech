import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PostAuthRedirect } from "./components/PostAuthRedirect";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ClientDashboardRoute } from "./dashboard/ClientDashboardRoute";
import { SlackMock } from "./dashboard/SlackMock";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { LandingPage } from "./landing/LandingPage";
import { OnboardingRoute } from "./onboarding/OnboardingRoute";
import { PitchDeck } from "./pitch/PitchDeck";
import { PresentPage } from "./pages/PresentPage";
import { ClientSignupRoute } from "./client/ClientSignupRoute";
import { PendingVerificationPage } from "./client/PendingVerificationPage";
import { CanvasRoute } from "./canvas/CanvasRoute";
import { CanvasShell } from "./canvas/CanvasShell";
import { CanvasWorkspacePage } from "./canvas/CanvasWorkspacePage";
import { CanvasDashboardView } from "./canvas/CanvasDashboardView";
import { CanvasProfilePage } from "./canvas/CanvasProfilePage";
import { CanvasWorkflowSoon } from "./canvas/CanvasWorkflowSoon";
import { CanvasWebhooksPage } from "./canvas/CanvasWebhooksPage";
import { CanvasEmbedPage } from "./canvas/CanvasEmbedPage";
import { CanvasHelpPage } from "./canvas/CanvasHelpPage";
import { CanvasCategoriesPage } from "./canvas/pages/CanvasCategoriesPage";
import { CategoryDashboardPage } from "./canvas/CategoryDashboardPage";
import { ClientSetupRoute } from "./client/ClientSetupRoute";
import { SessionsPage } from "./dashboard/pages/SessionsPage";
import { AnalyticsPage } from "./dashboard/pages/AnalyticsPage";
import { SettingsPage } from "./dashboard/pages/SettingsPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="deck" element={<PitchDeck />} />
          <Route path="slack" element={<SlackMock />} />
          <Route path="present" element={<PresentPage />} />
          <Route path="login/*" element={<LoginPage />} />
          <Route path="register/*" element={<RegisterPage />} />
          <Route path="auth/callback" element={<PostAuthRedirect />} />
          <Route path="client/signup" element={<ClientSignupRoute />} />
          <Route path="client/pending" element={<PendingVerificationPage />} />
          <Route path="client/setup" element={<ClientSetupRoute />} />
          <Route path="onboard" element={<OnboardingRoute />} />
          <Route path="dashboard/*" element={<ClientDashboardRoute />} />

          <Route path="canvas" element={<CanvasRoute />}>
            <Route element={<CanvasShell />}>
              <Route index element={<CanvasWorkspacePage />} />
              <Route path="dashboard/*" element={<CategoryDashboardPage />} />
              <Route
                path="sessions"
                element={
                  <CanvasDashboardView hideSubheader>
                    <SessionsPage />
                  </CanvasDashboardView>
                }
              />
              <Route
                path="analytics"
                element={
                  <CanvasDashboardView>
                    <AnalyticsPage />
                  </CanvasDashboardView>
                }
              />
              <Route path="profile" element={<CanvasProfilePage />} />
              <Route path="workflow" element={<CanvasWorkflowSoon />} />
              <Route path="webhooks" element={<CanvasWebhooksPage />} />
              <Route path="embed" element={<CanvasEmbedPage />} />
              <Route path="help" element={<CanvasHelpPage />} />
              <Route path="categories" element={<CanvasCategoriesPage />} />
              <Route
                path="settings"
                element={
                  <CanvasDashboardView>
                    <SettingsPage hidePageHeader />
                  </CanvasDashboardView>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
