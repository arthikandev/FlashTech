import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";
import { DashboardShell } from "./shell/DashboardShell";
import { NotificationsCenter } from "./sections/NotificationsCenter";
import { OverviewPage } from "./pages/OverviewPage";

function DashboardLayoutInner({ standalone = false }: { readonly standalone?: boolean }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const ctx = useDashboardContext();

  return (
    <DashboardShell
      workspaceLabel={ctx.workspaceLabel}
      search={ctx.search}
      onSearchChange={ctx.setSearch}
      signedIn={ctx.signedIn}
      feedEvents={ctx.feedEvents}
      notificationsOpen={notificationsOpen}
      onNotificationsOpenChange={setNotificationsOpen}
      notificationsPanel={
        <NotificationsCenter
          events={ctx.feedEvents}
          signedIn={ctx.signedIn}
          hasMembership={ctx.hasMembershipForEmbed}
        />
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {standalone ? <OverviewPage /> : <Outlet />}
      </div>
    </DashboardShell>
  );
}

export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardLayoutInner />
    </DashboardProvider>
  );
}

export function DashboardPageStandalone() {
  return (
    <DashboardProvider>
      <DashboardLayoutInner standalone />
    </DashboardProvider>
  );
}
