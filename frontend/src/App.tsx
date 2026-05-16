import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PostAuthRedirect } from "./components/PostAuthRedirect";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { ClientDashboardRoute } from "./dashboard/ClientDashboardRoute";
import { SlackMock } from "./dashboard/SlackMock";
import { SeylanPage } from "./demos/SeylanPage";
import { CloudMetricsPage } from "./demos/CloudMetricsPage";
import { CoralPage } from "./demos/CoralPage";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { LandingPage } from "./landing/LandingPage";
import { OnboardingRoute } from "./onboarding/OnboardingRoute";
import { PitchDeck } from "./pitch/PitchDeck";
import { PresentPage } from "./pages/PresentPage";
import { ClientSignupRoute } from "./client/ClientSignupRoute";
import { PendingVerificationPage } from "./client/PendingVerificationPage";

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
          <Route path="onboard" element={<OnboardingRoute />} />
          <Route path="dashboard/*" element={<ClientDashboardRoute />} />
          <Route element={<Layout />}>
            <Route path="demos/seylan" element={<SeylanPage />} />
            <Route path="demos/cloudmetrics" element={<CloudMetricsPage />} />
            <Route path="demos/coral" element={<CoralPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
