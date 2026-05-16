export type LandingNavItem =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  { label: "Our story", href: "#about" },
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demos", href: "#demos" },
  { label: "Stories", href: "#testimonials" },
  { label: "Dashboard", to: "/dashboard" },
];
