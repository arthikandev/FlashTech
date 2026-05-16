import { enMessages } from "./en";
import { taMessages } from "./ta";
import type { LandingLocale } from "../types";
import type { MessageKey } from "./en";

const catalogs: Record<LandingLocale, Record<MessageKey, string>> = {
  en: enMessages,
  ta: taMessages,
};

export function translate(locale: LandingLocale, key: MessageKey): string {
  return catalogs[locale][key] ?? catalogs.en[key] ?? key;
}

export type { MessageKey };
