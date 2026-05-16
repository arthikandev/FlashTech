import type { ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { AiIntelligenceFeed } from "./AiIntelligenceFeed";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { FeedEvent } from "@/lib/dashboard/feedEvents";

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
  return (
    <div className="dark dash-theme min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <DashboardSidebar workspaceLabel={workspaceLabel} />
        <SidebarInset>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:p-4 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <DashboardTopBar
            search={search}
            onSearchChange={onSearchChange}
            onOpenNotifications={() => onNotificationsOpenChange(true)}
            signedIn={signedIn}
            sidebarTrigger={<SidebarTrigger className="lg:hidden" />}
          />
          <div className="flex min-h-[calc(100vh-3.5rem)]">
            <main
              id="main-content"
              className="min-w-0 flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:pb-8"
            >
              {children}
            </main>
            <aside className="hidden w-[300px] shrink-0 border-l border-border xl:block">
              <AiIntelligenceFeed events={feedEvents} />
            </aside>
          </div>
          <DashboardMobileNav />
        </SidebarInset>
      </SidebarProvider>

      <Sheet
        open={notificationsOpen}
        onClose={() => onNotificationsOpenChange(false)}
        side="right"
        title="Notifications"
      >
        {notificationsPanel}
      </Sheet>
    </div>
  );
}
