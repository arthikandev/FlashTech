import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState, type ReactNode } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { clerkEnabled } from "@/convex/api";

const AUTH_TIMEOUT_MS = 10_000;
const CLERK_CONVEX_SETUP_URL = "https://dashboard.clerk.com/last-active?path=integrations/convex";

const issuerHint =
  (import.meta.env.VITE_CLERK_JWT_ISSUER_DOMAIN as string | undefined)?.trim() || "";

type Props = {
  children: ReactNode;
  label?: string;
};

/**
 * Blocks only while Clerk + Convex auth handshake is in progress.
 * Does not wait for workspace/membership queries.
 */
export function WorkspaceAuthGate({
  children,
  label = "Connecting account…",
}: Props) {
  const { isLoaded: clerkLoaded, isSignedIn, getToken } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const authReady = !clerkEnabled || (clerkLoaded && !convexAuthLoading);
  const needsAuth =
    clerkEnabled && authReady && Boolean(isSignedIn) && (!isAuthenticated || convexAuthLoading);

  useEffect(() => {
    if (!needsAuth) {
      setTimedOut(false);
      setTokenError(null);
      return;
    }
    const id = window.setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [needsAuth]);

  useEffect(() => {
    if (!timedOut || !isSignedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken({ template: "convex" });
        if (cancelled) return;
        if (!token) {
          setTokenError(
            'Clerk returned no token for template "convex". Activate the Convex integration in Clerk (creates the JWT template).'
          );
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setTokenError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [timedOut, isSignedIn, getToken]);

  if (!needsAuth) {
    return <>{children}</>;
  }

  if (timedOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="max-w-md text-sm text-foreground">
          Could not connect your account to the workspace backend.
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          In{" "}
          <a
            href={CLERK_CONVEX_SETUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Clerk → Convex integration
          </a>
          , activate Convex for this app. Then set on Convex (use your Clerk Frontend API URL from Clerk → API
          keys):
        </p>
        <code className="max-w-md break-all rounded bg-muted px-2 py-1 text-xs text-foreground">
          CLERK_JWT_ISSUER_DOMAIN=
          {issuerHint || "https://your-instance.clerk.accounts.dev"}
        </code>
        <p className="max-w-md text-xs text-muted-foreground">
          Run <code className="rounded bg-muted px-1">cd backend && npx convex dev --once</code>{" "}
          after changing env vars.
        </p>
        {tokenError ? (
          <p className="max-w-md rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {tokenError}
          </p>
        ) : null}
        <button
          type="button"
          className="text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingState variant="fullscreen" label={label} />
    </div>
  );
}
