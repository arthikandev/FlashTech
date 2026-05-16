import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";

export function getConvexUrl(): string | undefined {
  const url = import.meta.env.VITE_CONVEX_URL?.trim();
  if (!url || !url.includes(".convex.cloud")) return undefined;
  return url;
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
        <div className="max-w-md rounded-xl border border-[#212121] bg-[#101010] p-8 text-center">
          <h2 className="text-lg font-medium text-[#E1E0CC] mb-2">
            Convex not configured
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Copy <code className="text-primary">frontend/.env.example</code> to{" "}
            <code className="text-primary">.env.local</code> and set{" "}
            <code className="text-primary">VITE_CONVEX_URL</code> to match backend{" "}
            <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code>. Ensure Person
            2 runs <code className="text-primary">npx convex dev</code> from{" "}
            <code className="text-primary">backend/</code>.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
