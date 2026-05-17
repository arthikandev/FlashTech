import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  LayoutGrid,
  Layers,
  MessageSquare,
  Radio,
  Settings,
  User,
  Webhook,
  Workflow,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTenant } from "@/tenant/TenantContext";
import { t } from "../i18n/canvas.en";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type NavItem = {
  to: string;
  labelKey: keyof typeof import("../i18n/canvas.en").canvasMessages;
  icon: typeof MessageSquare;
  end?: boolean;
  soon?: boolean;
};

export function CanvasSidebar({ collapsed, onToggleCollapse }: Props) {
  const { embedKey } = useTenant();
  const location = useLocation();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;

  const mainItems: NavItem[] = [
    { to: `/canvas${qs}`, labelKey: "sidebar.advisor", icon: MessageSquare, end: true },
    { to: `/canvas/sessions${qs}`, labelKey: "sidebar.sessions", icon: Radio },
    { to: `/canvas/analytics${qs}`, labelKey: "sidebar.analytics", icon: BarChart3 },
  ];

  const automationItems: NavItem[] = [
    { to: `/canvas/workflow${qs}`, labelKey: "sidebar.workflow", icon: Workflow },
    { to: `/canvas/webhooks${qs}`, labelKey: "sidebar.webhooks", icon: Webhook },
    { to: `/canvas/embed${qs}`, labelKey: "sidebar.embed", icon: Code2 },
  ];

  const accountItems: NavItem[] = [
    { to: `/canvas/categories${qs}`, labelKey: "sidebar.categories", icon: Layers },
    { to: `/canvas/help${qs}`, labelKey: "sidebar.help", icon: CircleHelp },
    { to: `/canvas/profile${qs}`, labelKey: "sidebar.profile", icon: User },
    { to: `/canvas/settings${qs}`, labelKey: "sidebar.settings", icon: Settings },
  ];

  function isActive(item: NavItem) {
    const path = item.to.split("?")[0];
    if (item.end) {
      return location.pathname === "/canvas" || location.pathname === "/canvas/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function renderItems(items: NavItem[]) {
    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item);
      return (
        <Link
          key={item.labelKey}
          to={item.to}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2.5 text-sm transition-colors",
            active
              ? "bg-primary/12 font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
          title={t(item.labelKey)}
        >
          <Icon className="size-4 shrink-0" />
          {!collapsed && (
            <span className="flex flex-1 items-center justify-between gap-1">
              <span>{t(item.labelKey)}</span>
              {item.soon ? (
                <span className="rounded-full border border-border px-1.5 py-0 text-[9px] uppercase tracking-wide text-muted-foreground">
                  {t("sidebar.soon")}
                </span>
              ) : null}
            </span>
          )}
        </Link>
      );
    });
  }

  return (
    <aside
      className={cn(
        "relative z-10 flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-20 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        aria-label={t("sidebar.collapse")}
      >
        {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      <nav className="flex flex-1 flex-col gap-1 p-3 pt-8">
        {renderItems(mainItems)}
        {!collapsed ? (
          <p className="mt-3 px-2 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            {t("sidebar.automation")}
          </p>
        ) : null}
        {renderItems(automationItems)}
        {!collapsed ? <div className="my-2 border-t border-border" /> : null}
        {renderItems(accountItems)}
        <Link
          to="/#industries"
          className={cn(
            "mt-2 flex items-center gap-2 rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            collapsed && "justify-center px-0"
          )}
          title={t("sidebar.useCases")}
        >
          <LayoutGrid className="size-4 shrink-0" />
          {!collapsed && <span>{t("sidebar.useCases")}</span>}
        </Link>
      </nav>
    </aside>
  );
}
