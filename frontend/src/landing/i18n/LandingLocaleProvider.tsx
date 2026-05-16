import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translate, type MessageKey } from "./messages";
import { LOCALE_STORAGE_KEY, type LandingLocale } from "./types";

type LandingLocaleContextValue = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  t: (key: MessageKey) => string;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

function readStoredLocale(): LandingLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "ta") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>(readStoredLocale);

  const setLocale = useCallback((next: LandingLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LandingLocaleContext.Provider value={value}>{children}</LandingLocaleContext.Provider>
  );
}

export function useLandingLocale(): LandingLocaleContextValue {
  const ctx = useContext(LandingLocaleContext);
  if (!ctx) {
    throw new Error("useLandingLocale must be used within LandingLocaleProvider");
  }
  return ctx;
}
