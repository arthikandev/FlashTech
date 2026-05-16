import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { goToBackendDashboard } from "@/lib/backendUrl";
import { isOnboardingComplete } from "@/onboarding/storage";

function BackendDashboardRedirect() {
  useEffect(() => {
    void goToBackendDashboard();
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
      Opening dashboard…
    </div>
  );
}

export function DashboardRoute() {
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboard" replace />;
  }

  return <BackendDashboardRedirect />;
}
