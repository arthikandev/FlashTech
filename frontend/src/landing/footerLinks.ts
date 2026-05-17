import type { MessageKey } from "./i18n/messages";

export const FOOTER_PRODUCT = [
  { key: "footer.dashboard" as MessageKey, to: "/canvas" },
  { key: "footer.demos" as MessageKey, to: "/demos/seylan" },
  { key: "footer.onboard" as MessageKey, to: "/onboard" },
  { key: "footer.embedSdk" as MessageKey, href: "#features" },
  { key: "footer.pricing" as MessageKey, href: "#pricing" },
  {
    key: "footer.apiDocs" as MessageKey,
    href: "https://docs.presenceiq.ai",
    external: true,
  },
] as const;

export const FOOTER_COMPANY = [
  { key: "footer.about" as MessageKey, href: "#about" },
  { key: "footer.contact" as MessageKey, href: "mailto:hello@presenceiq.ai" },
  { key: "footer.terms" as MessageKey, href: "#", disabled: true },
  { key: "footer.privacy" as MessageKey, href: "#", disabled: true },
] as const;
