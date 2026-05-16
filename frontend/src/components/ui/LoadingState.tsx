type Variant = "card" | "table" | "fullscreen" | "inline";

type Props = {
  variant?: Variant;
  label?: string;
  rows?: number;
};

export function LoadingState({ variant = "inline", label, rows = 4 }: Props) {
  if (variant === "fullscreen") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-gray-500">{label ?? "Loading…"}</p>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-[#161616] border border-[#212121]"
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-[#161616] border border-[#212121]"
          />
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-gray-500 py-4">{label ?? "Loading…"}</p>
  );
}
