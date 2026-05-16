import { ProtectedRoute } from "../components/ProtectedRoute";
import { DashboardPage } from "./DashboardPage";

export function DashboardRoute() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
