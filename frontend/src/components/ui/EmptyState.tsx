import type { LucideIcon } from "lucide-react";
import { Inbox, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Preset = "no-data" | "no-results" | "error";

type Props = {
  preset?: Preset;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "dark" | "light";
};

const PRESETS: Record<
  Preset,
  { icon: LucideIcon; title: string; description: string }
> = {
  "no-data": {
    icon: Inbox,
    title: "No data yet",
    description: "Activity will appear here once visitors interact with your avatar.",
  },
  "no-results": {
    icon: Search,
    title: "No results",
    description: "Try adjusting your search or filters.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We could not load this section. Please try again.",
  },
};

export function EmptyState({
  preset = "no-data",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = "dark",
}: Props) {
  const presetConfig = PRESETS[preset];
  const Icon = icon ?? presetConfig.icon;
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 px-4 text-center",
        isLight ? "border-border bg-muted/40" : "border-[#212121] bg-[#0a0a0a]/50"
      )}
    >
      <Icon
        className={cn("h-8 w-8", isLight ? "text-muted-foreground" : "text-gray-600")}
        strokeWidth={1.25}
      />
      <h3
        className={cn(
          "text-sm font-medium",
          isLight ? "text-foreground" : "text-[#E1E0CC]"
        )}
      >
        {title ?? presetConfig.title}
      </h3>
      <p
        className={cn(
          "max-w-sm text-xs",
          isLight ? "text-muted-foreground" : "text-gray-500"
        )}
      >
        {description ?? presetConfig.description}
      </p>
      {actionLabel && onAction ? (
        <Button variant="outline" className="mt-1 text-xs" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
