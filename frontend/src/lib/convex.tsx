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
          <p className="text-sm text-gray-400 leading-relaxed">
            Copy <code className="text-primary">frontend/.env.example</code> to{" "}
            <code className="text-primary">.env.local</code> and set{" "}
            <code className="text-primary">VITE_CONVEX_URL</code>, or add{" "}
            <code className="text-primary">convexUrl</code> to{" "}
            <code className="text-primary">public/runtime-config.json</code>. Run{" "}
            <code className="text-primary">npm run setup</code> from the repo root.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
