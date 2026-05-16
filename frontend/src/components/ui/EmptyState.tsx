import type { LucideIcon } from "lucide-react";
import { Inbox, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Preset = "no-data" | "no-results" | "error";

type Props = {
  preset?: Preset;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
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
}: Props) {
  const presetConfig = PRESETS[preset];
  const Icon = icon ?? presetConfig.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center rounded-xl border border-dashed border-[#212121] bg-[#0a0a0a]/50">
      <Icon className="h-8 w-8 text-gray-600" strokeWidth={1.25} />
      <h3 className="text-sm font-medium text-[#E1E0CC]">
        {title ?? presetConfig.title}
      </h3>
      <p className="max-w-sm text-xs text-gray-500">
        {description ?? presetConfig.description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" className="text-xs mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
