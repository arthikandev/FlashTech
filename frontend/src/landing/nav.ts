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

/** Product-first nav — order: Platform → Pricing → About → Workspace */
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
  { type: "link", key: "nav.pricing", href: "#pricing" },
  { type: "link", key: "nav.about", href: "#about" },
  { type: "link", key: "nav.workspace", to: "/canvas", emphasize: true },
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
