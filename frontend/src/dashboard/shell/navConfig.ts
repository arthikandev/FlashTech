export type NavItem = { label: string; href: string; end?: boolean };

export type NavSection = { title: string; items: NavItem[] };

export const DASHBOARD_NAV: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Overview", href: "/canvas", end: true },
      { label: "Live Sessions", href: "/canvas/sessions" },
      { label: "Analytics", href: "/canvas/analytics" },
    ],
  },
  {
    title: "AUTOMATION",
    items: [
      { label: "Workflow", href: "/canvas/workflow" },
    ],
  },
  {
    title: "AVATAR",
    items: [
      { label: "Avatar", href: "/canvas/settings" },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Settings", href: "/canvas/settings" },
    ],
  },
];

export const MOBILE_TABS: NavItem[] = [
  { label: "Advisor", href: "/canvas", end: true },
  { label: "Live", href: "/canvas/sessions" },
  { label: "Analytics", href: "/canvas/analytics" },
  { label: "Workflow", href: "/canvas/workflow" },
  { label: "Settings", href: "/canvas/settings" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/canvas": "Test advisor",
  "/canvas/sessions": "Live Sessions",
  "/canvas/analytics": "Analytics",
  "/canvas/workflow": "Workflow",
  "/canvas/settings": "Settings",
};

export function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/canvas/sessions")) return "Live Sessions";
  return "Workspace";
}

const ROUTE_TO_SECTION: Record<string, string> = {
  "/canvas": "overview",
  "/canvas/sessions": "live-sessions",
  "/canvas/analytics": "heatmap",
  "/canvas/workflow": "workflow",
  "/canvas/settings": "overview",
};

export function scrollToSection(href: string) {
  const id = href.startsWith("#")
    ? href.slice(1)
    : (ROUTE_TO_SECTION[href] ?? "overview");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
