import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { DashboardProvider } from "@/dashboard/context/DashboardContext";
import { CategoryDashboardStrip } from "../shell/CategoryDashboardStrip";
import { CanvasSubpageHeader } from "../shell/CanvasSubpageHeader";
import { t } from "../i18n/canvas.en";

type Props = {
  readonly children: ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
  readonly hideSubheader?: boolean;
};

const PAGE_META: Record<
  string,
  { titleKey: keyof typeof import("../i18n/canvas.en").canvasMessages; subtitle?: string }
> = {
  "/canvas/sessions": {
    titleKey: "sidebar.sessions",
    subtitle: "Real-time visitor intelligence",
  },
  "/canvas/analytics": {
    titleKey: "sidebar.analytics",
    subtitle: "Conversation and intent analytics",
  },
  "/canvas/settings": {
    titleKey: "sidebar.settings",
    subtitle: "Workspace, avatar, and webhooks",
  },
};

/** Wraps legacy dashboard pages inside the canvas shell. */
export function CanvasDashboardView({
  children,
  title,
  subtitle,
  hideSubheader = false,
}: Props) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname];
  const resolvedTitle = title ?? (meta ? t(meta.titleKey) : undefined);
  const resolvedSubtitle = subtitle ?? meta?.subtitle;
  const showCategoryStrip = location.pathname === "/canvas/settings";

  return (
    <DashboardProvider>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          {!hideSubheader && resolvedTitle ? (
            <CanvasSubpageHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
          ) : null}
          {showCategoryStrip ? <CategoryDashboardStrip /> : null}
          {children}
        </div>
      </div>
    </DashboardProvider>
  );
}
