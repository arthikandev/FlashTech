import { UserButton } from "@clerk/clerk-react";
import type { ComponentType } from "react";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Radio,
  Settings,
  Workflow,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { clerkEnabled } from "@/convex/api";
import { DASHBOARD_NAV } from "./navConfig";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Overview: LayoutDashboard,
  "Live Sessions": Radio,
  Analytics: BarChart3,
  Workflow: Workflow,
  Avatar: Bot,
  Settings: Settings,
};

type Props = {
  workspaceLabel: string;
};

export function DashboardSidebar({ workspaceLabel }: Props) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1 text-sm font-semibold">
          PresenceIQ
          <span className="live-dot" aria-hidden />
        </Link>
        <p className="truncate px-2 pb-2 text-xs text-muted-foreground">{workspaceLabel}</p>
      </SidebarHeader>
      <SidebarContent>
        {DASHBOARD_NAV.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = ICONS[item.label] ?? LayoutDashboard;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <NavLink
                            to={item.href}
                            end={item.end}
                            className={({ isActive }) => (isActive ? "font-medium" : "")}
                          />
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
          {clerkEnabled ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              PIQ
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{workspaceLabel}</p>
            <p className="text-[10px] text-muted-foreground">AI active</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
