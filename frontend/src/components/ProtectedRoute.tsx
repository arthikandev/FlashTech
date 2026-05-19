import { SignedIn, SignedOut } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  if (!clerkEnabled) {
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
