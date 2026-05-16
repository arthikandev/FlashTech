import type { ReactNode } from "react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { AiIntelligenceFeed } from "./AiIntelligenceFeed";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { FeedEvent } from "../hooks/useAiFeedEvents";

type Props = {
  workspaceLabel: string;
  search: string;
  onSearchChange: (v: string) => void;
  signedIn: boolean;
  feedEvents: FeedEvent[];
  notificationsOpen: boolean;
  onNotificationsOpenChange: (open: boolean) => void;
  notificationsPanel: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  workspaceLabel,
  search,
  onSearchChange,
  signedIn,
  feedEvents,
  notificationsOpen,
  onNotificationsOpenChange,
  notificationsPanel,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-dash-bg text-dash-ink font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-dash-accent focus:text-black"
      >
        Skip to content
      </a>

      <div className="hidden lg:flex shrink-0">
        <DashboardSidebar workspaceLabel={workspaceLabel} />
      </div>

      <Sheet open={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left" title="Menu">
        <DashboardSidebar
          workspaceLabel={workspaceLabel}
          onNavigate={() => setSidebarOpen(false)}
        />
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar
          search={search}
          onSearchChange={onSearchChange}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNotifications={() => onNotificationsOpenChange(true)}
          signedIn={signedIn}
        />

        <div className="flex min-h-0 flex-1">
          <main
            id="main-content"
            className="min-w-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8 pb-24 lg:pb-8"
          >
            {children}
          </main>

          <div className="hidden xl:flex w-[320px] shrink-0">
            <AiIntelligenceFeed events={feedEvents} />
          </div>
        </div>

        <DashboardMobileNav />
      </div>

      <Sheet
        open={notificationsOpen}
        onClose={() => onNotificationsOpenChange(false)}
        title="Notifications"
      >
        {notificationsPanel}
      </Sheet>
    </div>
  );
}
