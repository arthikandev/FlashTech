import { Navigate, useLocation } from "react-router-dom";

/** Legacy `/dashboard/*` → `/canvas/*` (avatar page → settings). */
export function DashboardRedirect() {
  const { pathname, search } = useLocation();
  let canvasPath = pathname.replace(/^\/dashboard/, "/canvas") || "/canvas";
  if (canvasPath === "/canvas/avatar") {
    canvasPath = "/canvas/settings";
  }
  return <Navigate to={`${canvasPath}${search}`} replace />;
}
