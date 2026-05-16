import { Bot, MessageSquare, Sparkles, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const COMPARISONS: Array<{
  icon: LucideIcon;
  without: string;
  with: string;
}> = [
  {
    icon: Bot,
    without: "Avatar that reacts to what you say",
    with: "Avatar that already knows who you are",
  },
  {
    icon: MessageSquare,
    without: "Generic: Hi, how can I help you?",
    with: "Welcome back Sarangan — shall we pick up where you left off?",
  },
  {
    icon: Sparkles,
    without: "Same system prompt for all visitors",
    with: "Dynamic prompt built per visitor from live intelligence",
  },
  {
    icon: Users,
    without: "Single use case, single industry",
    with: "Six enterprise industries — one unified platform",
  },
  {
    icon: Zap,
    without: "Chatbot with a face",
    with: "Conversation intelligence layer for enterprise",
  },
];

export function InsightSection() {
  return (
    <section id="insight" className="section-pad bg-[#101010] px-4 border-y border-[#212121]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="The core insight"
          title="What makes PresenceIQ 10/10"
          subtitle="Every other team builds reactive chatbots. PresenceIQ builds pre-conversation intelligence."
        />

        <div className="grid sm:grid-cols-2 gap-4">
          {COMPARISONS.map((row) => {
            const Icon = row.icon;
            return (
              <article
                key={row.without}
                className="grid grid-cols-2 gap-0 rounded-2xl border border-[#212121] overflow-hidden"
              >
                <div className="p-4 sm:p-5 bg-black/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">
                      Without
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{row.without}</p>
                </div>
                <div className="p-4 sm:p-5 bg-primary/5 border-l border-[#212121]">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest text-primary">
                      With PresenceIQ
                    </span>
                  </div>
                  <p className="text-sm text-[#E1E0CC] leading-relaxed">{row.with}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
