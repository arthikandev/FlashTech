import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/ui/LoadingState";
import { isOnboardingComplete } from "@/onboarding/storage";
import { isValidEmbedKey, resolveCanvasPath } from "@/lib/postAuth";
import { useTenant } from "./TenantContext";

const MEMBERSHIPS_TIMEOUT_MS = 10_000;

type Props = {
  children: ReactNode;
  loadingLabel?: string;
};

/**
 * After Convex auth: loads memberships, redirects to onboarding when needed,
 * otherwise renders children (dashboard/canvas) with a compact loader.
 */
export function WorkspaceGate({
  children,
  loadingLabel = "Loading workspace…",
}: Props) {
  const { signedIn, memberships } = useTenant();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  const membershipsLoading = signedIn && memberships === undefined;

  useEffect(() => {
    if (!membershipsLoading) {
      setTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setTimedOut(true), MEMBERSHIPS_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [membershipsLoading]);

  if (!signedIn) {
    return <>{children}</>;
  }

  if (membershipsLoading) {
    if (timedOut) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="max-w-md text-sm text-foreground">
            Workspace data is taking longer than expected.
          </p>
          <p className="max-w-md text-xs text-muted-foreground">
            Check your network connection and Convex deployment logs, then try again.
          </p>
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
        <LoadingState variant="fullscreen" label={loadingLabel} />
      </div>
    );
  }

  const hasMember = (memberships ?? []).some((m) => m.business?.embedKey);
  if (!hasMember && !isOnboardingComplete()) {
    return <Navigate to="/onboard" replace />;
  }

  if (signedIn && hasMember && location.pathname.startsWith("/canvas")) {
    const urlKey = new URLSearchParams(location.search).get("embedKey");
    if (!isValidEmbedKey(urlKey)) {
      return <Navigate to={resolveCanvasPath(memberships)} replace />;
    }
  }

  return <>{children}</>;
}
