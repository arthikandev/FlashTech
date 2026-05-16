import { motion, useInView } from "framer-motion";
import {
  Bot,
  Fingerprint,
  MessageSquare,
  Mic,
  Sparkles,
  User,
  Workflow,
} from "lucide-react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS: Array<{
  step: number;
  action: string;
  tool: string;
  output: string;
  latency: string;
  icon: LucideIcon;
}> = [
  {
    step: 1,
    action: "Visitor fingerprint captured",
    tool: "Convex",
    output: "Session ID + page history",
    latency: "120ms",
    icon: Fingerprint,
  },
  {
    step: 2,
    action: "CRM record fetched",
    tool: "n8n",
    output: "Name, account type, churn risk",
    latency: "400ms",
    icon: Workflow,
  },
  {
    step: 3,
    action: "Behaviour analysis",
    tool: "Convex + OpenAI",
    output: "Intent signals",
    latency: "300ms",
    icon: Sparkles,
  },
  {
    step: 4,
    action: "Intent scored 0–100",
    tool: "OpenAI GPT-4o",
    output: "Score + opener text",
    latency: "450ms",
    icon: MessageSquare,
  },
  {
    step: 5,
    action: "Language & voice selected",
    tool: "ElevenLabs",
    output: "Voice model loaded",
    latency: "180ms",
    icon: Mic,
  },
  {
    step: 6,
    action: "Context injected into avatar",
    tool: "Beyond Presence",
    output: "Dynamic system prompt",
    latency: "200ms",
    icon: Bot,
  },
  {
    step: 7,
    action: "Avatar appears & speaks",
    tool: "BP + ElevenLabs",
    output: "Personalised first sentence",
    latency: "350ms",
    icon: User,
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="pipeline" ref={sectionRef} className="section-pad bg-black px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          eyebrow="Pre-conversation intelligence pipeline"
          title="All 7 steps complete in under 2 seconds"
          subtitle="Visitor lands → fingerprint → n8n CRM → GPT-4o intent → voice → Beyond Presence avatar → personalised opener"
        />

        <div className="relative mt-12 space-y-0">
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 border-l border-dashed border-[#212121]"
            aria-hidden
          />

          {STEPS.map((row, i) => {
            const Icon = row.icon;
            const alignRight = i % 2 === 1;

            return (
              <motion.div
                key={row.step}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease }}
                className={`relative flex flex-col lg:flex-row lg:items-center gap-6 py-6 ${
                  alignRight ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-black font-serif text-sm text-primary">
                  {row.step}
                </div>

                <div
                  className={`lg:w-[calc(50%-2.5rem)] ${
                    alignRight ? "lg:ml-auto lg:pl-8" : "lg:mr-auto lg:pr-8"
                  }`}
                >
                  <article className="rounded-2xl border border-[#212121] bg-[#101010] p-5 sm:p-6 hover-lift gradient-mesh">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 font-serif text-sm text-primary">
                          {row.step}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#212121]">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#E1E0CC]">{row.action}</p>
                          <span className="inline-block mt-1 rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary">
                            {row.tool}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-600 shrink-0">
                        {row.latency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 rounded-lg bg-black/50 border border-[#212121] px-3 py-2">
                      → {row.output}
                    </p>
                  </article>
                </div>

                <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" aria-hidden />
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Total wall time &lt; 2s · Every step feeds the next before the avatar speaks
        </p>
      </div>
    </section>
  );
}
