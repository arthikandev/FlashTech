import { Bot, Database, Mic, Sparkles, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const TOOLS: Array<{
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  docsUrl: string;
}> = [
  {
    name: "Beyond Presence",
    role: "Intelligent avatar face",
    description:
      "Managed Agents API with dynamic system prompts and iframe embed — context before first utterance.",
    icon: Bot,
    docsUrl: "https://docs.beyondpresence.ai",
  },
  {
    name: "OpenAI GPT-4o",
    role: "Intelligence engine",
    description:
      "PRE intent scoring, DURING BYO-LLM inside Beyond Presence, POST transcript summaries.",
    icon: Sparkles,
    docsUrl: "https://platform.openai.com/docs",
  },
  {
    name: "ElevenLabs",
    role: "Voice intelligence",
    description:
      "Industry voice personas in 30+ languages including Sinhala and Tamil from browser locale + CRM.",
    icon: Mic,
    docsUrl: "https://elevenlabs.io/docs",
  },
  {
    name: "Convex",
    role: "Real-time intelligence store",
    description:
      "Visitors, intelligence, and conversations with reactive dashboard updates under 100ms.",
    icon: Database,
    docsUrl: "https://docs.convex.dev",
  },
  {
    name: "Automation webhooks",
    role: "CRM & alerting bridge",
    description:
      "Bring your own HTTPS endpoints — CRM enrichment, Slack hot-leads, and post-call summaries in seconds.",
    icon: Workflow,
    docsUrl: "#stack",
  },
];

export function TechStackSection() {
  const { t } = useLandingLocale();

  return (
    <section id="stack" className="section-pad bg-black px-4 border-t border-[#212121]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("tech.eyebrow")}
          title={t("tech.title")}
          subtitle={t("tech.subtitle")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <article
                key={tool.name}
                className="rounded-2xl border border-[#212121] bg-[#101010] p-5 sm:p-6 flex gap-4 hover-lift"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-serif text-[#E1E0CC]">{tool.name}</h3>
                    <a
                      href={tool.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#212121] px-2 py-0.5 text-[10px] text-gray-500 hover:text-primary hover:border-primary/30 transition-colors"
                    >
                      Docs
                    </a>
                  </div>
                  <p className="text-xs text-primary/70 mt-0.5">{tool.role}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{tool.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
