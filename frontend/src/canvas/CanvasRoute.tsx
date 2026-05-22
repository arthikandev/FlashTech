import { Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { clerkEnabled } from "@/convex/api";
import { isOnboardingComplete } from "@/onboarding/storage";
import { TenantProvider } from "@/tenant/TenantContext";
import { WorkspaceAuthGate } from "@/tenant/WorkspaceAuthGate";
import { WorkspaceGate } from "@/tenant/WorkspaceGate";

export function CanvasRoute() {
  if (!clerkEnabled && !isOnboardingComplete()) {
    return <Navigate to="/onboard" replace />;
  }

  return (
    <ProtectedRoute>
      <WorkspaceAuthGate label="Connecting account…">
        <TenantProvider>
          <WorkspaceGate loadingLabel="Loading canvas…">
            <Outlet />
          </WorkspaceGate>
        </TenantProvider>
      </WorkspaceAuthGate>
    </ProtectedRoute>
  );
}
