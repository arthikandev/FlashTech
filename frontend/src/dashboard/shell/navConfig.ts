export type NavItem = { label: string; href: string; end?: boolean };

export type NavSection = { title: string; items: NavItem[] };

export const DASHBOARD_NAV: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Overview", href: "/dashboard", end: true },
      { label: "Live Sessions", href: "/dashboard/sessions" },
      { label: "Analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    title: "AUTOMATION",
    items: [
      { label: "Workflow", href: "/dashboard/workflow" },
    ],
  },
  {
    title: "AVATAR",
    items: [
      { label: "Avatar", href: "/dashboard/avatar" },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

export const MOBILE_TABS: NavItem[] = [
  { label: "Overview", href: "/dashboard", end: true },
  { label: "Live", href: "/dashboard/sessions" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Workflow", href: "/dashboard/workflow" },
  { label: "Avatar", href: "/dashboard/avatar" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/sessions": "Live Sessions",
  "/dashboard/analytics": "Analytics",
  "/dashboard/workflow": "Workflow",
  "/dashboard/avatar": "Avatar",
  "/dashboard/settings": "Settings",
};

export function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/dashboard/sessions")) return "Live Sessions";
  return "Dashboard";
}

const ROUTE_TO_SECTION: Record<string, string> = {
  "/dashboard": "overview",
  "/dashboard/sessions": "live-sessions",
  "/dashboard/analytics": "heatmap",
  "/dashboard/workflow": "workflow",
  "/dashboard/avatar": "avatar",
  "/dashboard/settings": "overview",
};

export function scrollToSection(href: string) {
  const id = href.startsWith("#")
    ? href.slice(1)
    : (ROUTE_TO_SECTION[href] ?? "overview");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
