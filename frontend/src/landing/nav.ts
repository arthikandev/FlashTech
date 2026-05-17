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

/** Product-first nav — order: Platform → Industries → Pricing → About → Live demos → Workspace */
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

/** Dark hero pill — matches reference nav bar */
export const LANDING_NAV_PILL_CLASS =
  "rounded-full border border-white/14 bg-black/45 px-4 py-2 md:px-5 md:py-2.5 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl";

/** Shared row height + flex alignment for every pill nav item (links and dropdown triggers). */
export const NAV_ITEM_LAYOUT =
  "inline-flex h-8 min-h-8 shrink-0 items-center justify-center gap-1 leading-none";

export const NAV_LINK_CLASS = [
  NAV_ITEM_LAYOUT,
  "nav-link whitespace-nowrap text-[0.8125rem] md:text-sm font-normal tracking-normal text-[#E1E0CC]/80 hover:text-[#fdfcf8] transition-colors rounded-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
].join(" ");

/** Brighter text only — same font weight so items stay vertically aligned. */
export function navLinkEmphasisClass(emphasize?: boolean): string {
  if (!emphasize) return "";
  return "text-[#fdfcf8] hover:text-white";
}
