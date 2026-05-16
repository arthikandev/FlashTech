import { Gauge, Languages, MessageCircle, Mic, Timer } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LiveSession } from "@/convex/types";

type Props = {
  sessions: LiveSession[] | undefined;
};

const METRICS = [
  { key: "latency", label: "Avg session duration", icon: Timer, suffix: "s" },
  { key: "voice", label: "Conversations", icon: Mic, suffix: "" },
  { key: "lang", label: "Languages used", icon: Languages, suffix: "" },
  { key: "greetings", label: "Successful greetings", icon: MessageCircle, suffix: "%" },
  { key: "csat", label: "Conversion rate", icon: Gauge, suffix: "%" },
] as const;

export function AvatarPerformance({ sessions }: Props) {
  if (sessions === undefined) {
    return (
      <section id="avatar">
        <SectionHeading
          title="Avatar Performance"
          subtitle="Beyond Presence session telemetry"
          align="left"
          compact
        />
        <LoadingState variant="card" rows={5} />
      </section>
    );
  }

  const list = sessions;
  if (list.length === 0) {
    return (
      <section id="avatar">
        <SectionHeading
          title="Avatar Performance"
          subtitle="Beyond Presence session telemetry"
          align="left"
          compact
        />
        <EmptyState
          preset="no-data"
          title="No avatar sessions yet"
          description="Start a demo conversation to see Beyond Presence performance metrics."
        />
      </section>
    );
  }

  const withConv = list.filter((s) => s.hasConversation);
  const durations = withConv
    .map((s) => s.conversationDuration)
    .filter((d): d is number => d != null && d > 0);
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;
  const langs = new Set(list.map((s) => s.language).filter(Boolean)).size;
  const greetingRate =
    list.length > 0 ? Math.round((withConv.length / list.length) * 100) : null;
  const converted = withConv.filter((s) => s.conversationOutcome === "converted").length;
  const conversionRate =
    withConv.length > 0 ? Math.round((converted / withConv.length) * 100) : null;

  const values: Record<string, string> = {
    latency: avgDuration != null ? String(avgDuration) : "—",
    voice: withConv.length > 0 ? String(withConv.length) : "—",
    lang: langs > 0 ? String(langs) : "—",
    greetings: greetingRate != null ? String(greetingRate) : "—",
    csat: conversionRate != null ? String(conversionRate) : "—",
  };

  return (
    <section id="avatar">
      <SectionHeading
        title="Avatar Performance"
        subtitle="Beyond Presence session telemetry from Convex"
        align="left"
        compact
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {METRICS.map(({ key, label, icon: Icon, suffix }) => (
          <div key={key} className="gradient-border rounded-xl p-4 text-center min-h-[88px]">
            <Icon className="h-4 w-4 text-primary mx-auto mb-2" />
            <p className="text-xl font-serif text-primary">
              {values[key]}
              {values[key] !== "—" && suffix && (
                <span className="text-xs text-gray-500">{suffix}</span>
              )}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
