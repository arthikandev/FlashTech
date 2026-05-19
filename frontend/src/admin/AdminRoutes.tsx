import { Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboardShell } from "./AdminDashboardShell";
import { AdminRouteGate } from "./AdminRouteGate";
import { AdminOverview } from "./sections/AdminOverview";
import { AdminAudit } from "./sections/AdminAudit";
import { AdminIntegrations } from "./sections/AdminIntegrations";
import { AdminTeam } from "./sections/AdminTeam";
import { AdminBilling } from "./sections/AdminBilling";
import { AdminEmbed } from "./sections/AdminEmbed";

export function AdminRoutes() {
  return (
    <AdminRouteGate>
      <Routes>
        <Route element={<AdminDashboardShell />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="embed" element={<AdminEmbed />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>
      </Routes>
    </AdminRouteGate>
  );
}
