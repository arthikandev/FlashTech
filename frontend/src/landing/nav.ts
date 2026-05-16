import type { MessageKey } from "./i18n/messages";

export type LandingNavItem =
  | { key: MessageKey; href: string; to?: never }
  | { key: MessageKey; to: string; href?: never };

export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  { key: "nav.ourStory", href: "#about" },
  { key: "nav.pipeline", href: "#pipeline" },
  { key: "nav.preview", href: "#preview" },
  { key: "nav.pricing", href: "#pricing" },
  { key: "nav.product", href: "#features" },
  { key: "nav.demos", to: "/demos/seylan" },
  { key: "nav.dashboard", to: "/dashboard" },
];

export const NAV_LINK_CLASS =
  "nav-link text-sm text-[#E1E0CC]/80 hover:text-[#E1E0CC] transition-colors";
