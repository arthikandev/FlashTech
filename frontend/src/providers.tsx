import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { authClerkAppearance } from "@/auth/clerkAppearance";
import { ConfettiAuthListener } from "@/components/ConfettiAuthListener";
import { resolveConvexUrl } from "@/lib/runtimeConfig";
import { ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Resolved after bootstrap loads runtime-config.json; falls back to VITE_* then team default. */
const convexUrlResolved = resolveConvexUrl()?.trim() ?? "";
const clerkKeyRaw = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function MissingConvexEnv() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 px-6 py-16 text-center text-neutral-100">
      <h1 className="text-xl font-semibold tracking-tight">Frontend env not configured</h1>
      <p className="max-w-lg text-sm leading-relaxed text-neutral-400">
        Vite embeds variables at{" "}
        <strong className="text-neutral-200">build time</strong>. This bundle was built without{" "}
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-200">VITE_CONVEX_URL</code>.
        Add it Vercel → Project → Environment Variables → Production (and Preview), then redeploy. It must match{" "}
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-200">NEXT_PUBLIC_CONVEX_URL</code>{" "}
        on the backend.
      </p>
      <p className="max-w-lg text-xs text-neutral-500">
        Or run <code className="text-neutral-400">bash devops/scripts/vercel-sync-env.sh frontend</code> from the
        repo, then redeploy (see docs/ENV.md).
      </p>
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const clerkKey = clerkKeyRaw?.trim() ?? "";
  const convexClient = useMemo(() => {
    if (!convexUrlResolved) return null;
    return new ConvexReactClient(convexUrlResolved);
  }, []);

  if (!convexClient) {
    return <MissingConvexEnv />;
  }

  const content = (
    <TooltipProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "border border-[#212121] bg-[#101010] text-[#E1E0CC]",
          },
        }}
      />
    </TooltipProvider>
  );

  if (!clerkKey) {
    return <ConvexProvider client={convexClient}>{content}</ConvexProvider>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey} appearance={authClerkAppearance}>
      <ConfettiAuthListener />
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {content}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
