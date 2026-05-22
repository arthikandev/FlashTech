import { useEffect, useMemo, useState } from "react";
import { buildAuthClerkAppearance, type ClerkThemeMode } from "./clerkAppearance";

function readThemeMode(): ClerkThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Reactive Clerk appearance for auth pages — follows light/dark toggle */
export function useAuthClerkAppearance() {
  const [mode, setMode] = useState<ClerkThemeMode>(readThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setMode(readThemeMode());
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);

  return useMemo(() => buildAuthClerkAppearance(mode), [mode]);
}

export function useClerkThemeMode(): ClerkThemeMode {
  const [mode, setMode] = useState<ClerkThemeMode>(readThemeMode);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setMode(readThemeMode());
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return mode;
}
