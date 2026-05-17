import { SignedIn } from "@clerk/clerk-react";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { clerkEnabled } from "@/convex/api";

/** Redirects signed-in users away from login/register to canvas or onboarding. */
export function AuthSignedInRedirect() {
  if (!clerkEnabled) return null;
  return (
    <SignedIn>
      <AuthSignedInRedirectInner />
    </SignedIn>
  );
}

function AuthSignedInRedirectInner() {
  usePostAuthRedirect(true);
  return null;
}
