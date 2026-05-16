import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LoadingState } from "@/components/ui/LoadingState";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";
import { DashboardShell } from "./shell/DashboardShell";
import { NotificationsCenter } from "./sections/NotificationsCenter";
import { OverviewPage } from "./pages/OverviewPage";

function DashboardLayoutInner({ standalone = false }: { standalone?: boolean }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const ctx = useDashboardContext();

  if (!ctx.authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState variant="fullscreen" label="Loading dashboard…" />
      </div>
    );
  }

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
          hasMembership={!ctx.needsMembership && ctx.signedIn}
        />
      }
    >
      <DashboardMain
        previewOnly={ctx.previewOnly}
        sessionsError={ctx.sessionsError}
        standalone={standalone}
      />
    </DashboardShell>
  );
}

function DashboardMain({
  previewOnly,
  sessionsError,
  standalone,
}: {
  previewOnly: boolean;
  sessionsError: string | null;
  standalone: boolean;
}) {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      {previewOnly && (
        <p className="rounded-md border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
          Preview mode — link your account for full workspace access.
        </p>
      )}
      {sessionsError && (
        <p className="rounded-md border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200/90">
          {sessionsError}
        </p>
      )}
      {standalone ? <OverviewPage /> : <Outlet />}
    </div>
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
