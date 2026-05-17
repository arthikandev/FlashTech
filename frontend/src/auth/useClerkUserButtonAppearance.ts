import { useMemo } from "react";
import { clerkUserButtonAppearance } from "./clerkAppearance";
import { useClerkThemeMode } from "./useAuthClerkAppearance";

export function useClerkUserButtonAppearance(extra?: Record<string, string>) {
  const mode = useClerkThemeMode();
  return useMemo(() => clerkUserButtonAppearance(mode, extra), [mode, extra]);
}
