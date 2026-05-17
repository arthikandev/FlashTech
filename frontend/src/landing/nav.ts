import { INDUSTRY_CATEGORIES } from "@/lib/categories/industryCategories";
import type { MessageKey } from "./i18n/messages";

export type NavLinkItem = {
  type: "link";
  key: MessageKey;
  href?: string;
  to?: string;
  emphasize?: boolean;
};

export type NavDropdownChild = {
  key: MessageKey;
  label?: string;
  href?: string;
  to?: string;
  description?: MessageKey;
};

export type NavDropdownItem = {
  type: "dropdown";
  key: MessageKey;
  emphasize?: boolean;
  children: NavDropdownChild[];
};

export type LandingNavEntry = NavLinkItem | NavDropdownItem;

const INDUSTRY_NAV_KEYS = [
  "nav.industry.banking",
  "nav.industry.saas",
  "nav.industry.hotels",
  "nav.industry.healthcare",
  "nav.industry.ecommerce",
  "nav.industry.hr",
] as const satisfies readonly MessageKey[];

/** Product-first nav with grouped dropdowns — matches landing sections & demos. */
export const LANDING_NAV_ENTRIES: LandingNavEntry[] = [
  {
    type: "dropdown",
    key: "nav.platform",
    children: [
      { key: "nav.dropdown.features", href: "#features" },
      { key: "nav.dropdown.howItWorks", href: "#pipeline" },
      { key: "nav.dropdown.preview", href: "#preview" },
      { key: "nav.dropdown.stack", href: "#stack" },
    ],
  },
  {
    type: "dropdown",
    key: "nav.industries",
    children: INDUSTRY_CATEGORIES.map((cat, i) => ({
      key: INDUSTRY_NAV_KEYS[i],
      to: cat.demoTo,
    })),
  },
  { type: "link", key: "nav.pricing", href: "#pricing" },
  { type: "link", key: "nav.about", href: "#about" },
  {
    type: "dropdown",
    key: "nav.liveDemos",
    emphasize: true,
    children: [
      {
        key: "nav.demo.seylan",
        to: "/sites/seylan/index.html",
        description: "nav.demo.seylanDesc",
      },
      {
        key: "nav.demo.cloudmetrics",
        to: "/sites/cloudmetrics/index.html",
        description: "nav.demo.cloudmetricsDesc",
      },
      {
        key: "nav.demo.coral",
        to: "/sites/coral/index.html",
        description: "nav.demo.coralDesc",
      },
    ],
  },
  { type: "link", key: "nav.workspace", to: "/canvas", emphasize: true },
];

/** @deprecated Use LANDING_NAV_ENTRIES — flat list for legacy consumers */
export type LandingNavItem =
  | { key: MessageKey; href: string; to?: never; emphasize?: boolean }
  | { key: MessageKey; to: string; href?: never; emphasize?: boolean };

export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  { key: "nav.platform", href: "#features" },
  { key: "nav.pricing", href: "#pricing" },
  { key: "nav.about", href: "#about" },
  { key: "nav.liveDemos", to: "/sites/seylan/index.html", emphasize: true },
  { key: "nav.workspace", to: "/canvas", emphasize: true },
];

export const NAV_LINK_CLASS =
  "nav-link whitespace-nowrap text-xs sm:text-sm text-[#E1E0CC]/85 hover:text-[#fdfcf8] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function navLinkEmphasisClass(emphasize?: boolean): string {
  if (!emphasize) return "";
  return "font-semibold text-primary hover:text-primary/90";
}
