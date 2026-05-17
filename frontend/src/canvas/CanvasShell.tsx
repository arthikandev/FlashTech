import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTenant } from "@/tenant/TenantContext";
import { IntegrationHealthProvider, useCanvasIntegrationHealth } from "./context/IntegrationHealthContext";
import { useUsageBalance } from "./hooks/useUsageBalance";
import { CanvasHeader } from "./shell/CanvasHeader";
import { CanvasSidebar } from "./shell/CanvasSidebar";
import { IntegrationStatusBar } from "./shell/IntegrationStatusBar";

function CanvasShellIntegrationStrip() {
  const health = useCanvasIntegrationHealth();
  const { pathname } = useLocation();
  const onAdvisor = pathname === "/canvas" || pathname === "/canvas/";
  const compact =
    onAdvisor ||
    pathname.startsWith("/canvas/dashboard") ||
    pathname.startsWith("/canvas/profile") ||
    pathname.startsWith("/canvas/settings") ||
    pathname.startsWith("/canvas/workflow");

  if (onAdvisor && health.canRunIntelligence && !health.error) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-border bg-card/40 px-3 py-1.5">
      <IntegrationStatusBar health={health} compact={compact} />
    </div>
  );
}

export function CanvasShell() {
  const { businessId } = useTenant();
  const { balance } = useUsageBalance(businessId);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <IntegrationHealthProvider>
      <div className="brand-theme relative flex min-h-[100dvh] flex-col bg-background text-foreground">
        <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.12] mix-blend-overlay" />

        <CanvasHeader usage={balance ?? undefined} />
        <CanvasShellIntegrationStrip />

        <div className="relative z-10 flex min-h-0 flex-1">
          <CanvasSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </IntegrationHealthProvider>
  );
}
