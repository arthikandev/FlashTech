import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";
import { resolveConvexUrl } from "./runtimeConfig";

export function getConvexUrl(): string | undefined {
  return resolveConvexUrl();
}

export function ConvexAppProvider({ children }: { children: ReactNode }) {
  const url = getConvexUrl();
  const client = useMemo(
    () => (url ? new ConvexReactClient(url) : null),
    [url]
  );

  if (!client) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-medium text-foreground mb-2">
            Convex not configured
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set <code className="text-primary">VITE_CONVEX_URL</code> in{" "}
            <code className="text-primary">frontend/.env.local</code> to match backend{" "}
            <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code>.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
