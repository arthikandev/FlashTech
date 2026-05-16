import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { fireConfettiFireworks } from "@/lib/confettiFireworks";

/**
 * Runs fireworks when Clerk session goes from signed-out → signed-in in this SPA session
 * (not on reload while already signed in).
 */
export function ConfettiAuthListener() {
  const { isLoaded, isSignedIn } = useAuth();
  const hydrated = useRef(false);
  const wasSignedOut = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!hydrated.current) {
      hydrated.current = true;
      wasSignedOut.current = !isSignedIn;
      return;
    }

    if (wasSignedOut.current && isSignedIn) {
      fireConfettiFireworks();
    }
    wasSignedOut.current = !isSignedIn;
  }, [isLoaded, isSignedIn]);

  return null;
}
