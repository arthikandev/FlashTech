import { SignedIn, SignedOut } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";

const DEMO_EMBED_KEYS = new Set(["seylan-demo", "cloudmetrics-demo", "coral-demo"]);

type Props = {
  children: ReactNode;
  allowDemoPreview?: boolean;
};

export function ProtectedRoute({ children, allowDemoPreview = true }: Props) {
  const location = useLocation();
  const embedKey = new URLSearchParams(location.search).get("embedKey")?.trim() ?? "";
  const isDemoPreview = allowDemoPreview && DEMO_EMBED_KEYS.has(embedKey);

  if (!clerkEnabled || isDemoPreview) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}
