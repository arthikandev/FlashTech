import { motion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { Button } from "@/components/ui/Button";
import { scrollToSection } from "../shell/navConfig";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  businessName?: string;
  liveCount?: number;
  bpAgentId?: string | null;
};

export function DashboardHero({ businessName, liveCount, bpAgentId }: Props) {
  const title = businessName
    ? `${businessName} Intelligence`
    : "Real-Time Customer Intelligence";
  const subtitle =
    liveCount != null && liveCount > 0
      ? `${liveCount} visitor${liveCount === 1 ? "" : "s"} tracked right now. Beyond Presence agents are live with intent-scored openers across your properties.`
      : "Beyond Presence agents are ready — PresenceIQ analyzes intent, sentiment, and conversation opportunities before every avatar session.";
  return (
    <section
      id="overview"
      className="relative min-h-[320px] overflow-hidden rounded-2xl gradient-border dashboard-hero-gradient"
    >
      <motion.div className="noise-overlay absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" aria-hidden />
      <div className="relative z-10 grid gap-8 p-6 md:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.p
            className="text-primary text-xs uppercase tracking-widest"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease }}
          >
            Beyond Presence · Live
          </motion.p>
          <motion.h1
            className="mt-2 font-serif text-3xl sm:text-4xl text-[#E1E0CC] leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="mt-4 max-w-lg text-sm text-gray-500 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease }}
          >
            {subtitle}
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease }}
          >
            <Button
              onClick={() => scrollToSection("#live-sessions")}
              className="rounded-full pl-5"
            >
              View Live Sessions
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("#cinema")}
              className="rounded-full"
            >
              <Radio className="h-4 w-4" />
              Open Avatar
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-xl border border-[#212121] bg-black/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, ease }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#212121]">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              Avatar preview
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary">
              Beyond Presence
            </span>
          </div>
          <BeyondPresenceFrame agentId={bpAgentId} height={280} className="rounded-none" />
        </motion.div>
      </div>
    </section>
  );
}
