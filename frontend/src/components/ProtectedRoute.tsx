import { SignInButton, SignedOut } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { clerkEnabled } from "@/convex/api";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  return (
    <>
      {clerkEnabled && (
        <SignedOut>
          <div className="mb-6 rounded-xl border border-[#212121] bg-[#101010] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              <span className="text-primary font-medium">Demo preview</span> — sign in to
              link your Clerk account and manage your tenants.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black"
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      )}
      {children}
    </>
  );
}
