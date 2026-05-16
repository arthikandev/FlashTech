import { ConvexAppProvider } from "../lib/convex";
import { DashboardPage } from "./DashboardPage";

export function DashboardRoute() {
  return (
    <ConvexAppProvider>
      <DashboardPage />
    </ConvexAppProvider>
  );
}
