import { useAuth } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";

/**
 * Adapter for ConvexProviderWithAuth — mirrors convex/react-clerk but does not
 * swallow getToken errors (missing "convex" JWT template surfaces in console).
 */
export function useAuthForConvex() {
  const { isLoaded, isSignedIn, getToken, orgId, orgRole, sessionClaims } = useAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const token =
        sessionClaims?.aud === "convex"
          ? await getToken({ skipCache: forceRefreshToken })
          : await getToken({ template: "convex", skipCache: forceRefreshToken });
      if (!token) {
        console.warn(
          "[PresenceIQ] Clerk getToken(convex) returned empty. Enable Clerk → Convex integration in the Clerk dashboard."
        );
      }
      return token;
    },
    [getToken, sessionClaims, orgId, orgRole]
  );

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken,
    }),
    [isLoaded, isSignedIn, fetchAccessToken]
  );
}
