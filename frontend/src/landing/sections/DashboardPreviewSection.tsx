import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

type FeedItem = { id: string; tag: string; message: string };

const INITIAL_FEED: FeedItem[] = [
  { id: "1", tag: "AI", message: "Intent score 87/100 — enterprise visitor on pricing" },
  { id: "2", tag: "CRM", message: "Returning customer: Sarangan N. · Premium account" },
  { id: "3", tag: "Avatar", message: "Personalised opener deployed in 1.8s" },
];

const LIVE_EVENTS = [
  { tag: "AI", message: "Hot lead threshold crossed — Slack alert queued" },
  { tag: "Sales", message: "Recommended action: schedule demo call" },
  { tag: "CRM", message: "Churn risk low — upsell signal detected" },
  { tag: "Avatar", message: "Session transcript saved to Convex" },
  { tag: "AI", message: "Intent 92/100 — pricing page, 3rd visit" },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

function BrowserChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-[#212121] bg-[#101010] overflow-hidden shadow-2xl"
      style={{ perspective: "1000px", transform: "rotateX(2deg)" }}
    >
      <div className="flex items-center gap-2 border-b border-[#212121] bg-black/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-2 rounded-md border border-[#212121] bg-[#212121]/50 px-3 py-1.5 text-[10px] text-gray-500 truncate">
          app.presenceiq.ai/dashboard
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function DashboardPreviewSection() {
  const { t } = useLandingLocale();
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = LIVE_EVENTS[eventIndex % LIVE_EVENTS.length]!;
      setEventIndex((i) => i + 1);
      setFeed((prev) => [
        { id: String(Date.now()), tag: next.tag, message: next.message },
        ...prev.slice(0, 5),
      ]);
    }, 4000);
    return () => clearInterval(id);
  }, [eventIndex]);

  return (
    <section id="preview" className="section-pad bg-[#101010] px-4 border-y border-[#212121]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("dashboard.eyebrow")}
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
        />

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <BrowserChrome>
            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <KpiCard label="Live sessions" value="12" animate />
                <KpiCard label="Avg intent" value="74" animate suffix="%" />
                <KpiCard label="Hot leads" value="3" animate />
                <KpiCard label="Pipeline" value="2" animate suffix="s" />
              </div>

              <div className="lg:col-span-4 rounded-xl border border-[#212121] glass-panel p-4 gradient-mesh">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                  Intent heatmap
                </p>
                <div className="grid grid-cols-4 gap-2 h-32 items-end">
                  {[40, 65, 85, 55, 70, 90, 45, 80, 60, 75, 95, 50].map((v, i) => (
                    <motion.div
                      key={i}
                      className="rounded bg-primary/20 min-h-[8px]"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.5, ease }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-3">Last 12 visitors · Convex reactive</p>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-[#212121] glass-panel p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-600">
                    AI intelligence feed
                  </p>
                </div>
                <ul className="space-y-2 flex-1 overflow-hidden">
                  {feed.map((e) => (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-[#212121] bg-black/50 px-3 py-2 text-xs"
                    >
                      <span className="text-primary/80 font-medium">{e.tag}</span>
                      <span className="text-gray-500 ml-2">{e.message}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </BrowserChrome>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/canvas"
            className="glow-pulse shimmer-btn inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
          >
            Open live dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  animate,
  suffix = "",
}: {
  label: string;
  value: string;
  animate?: boolean;
  suffix?: string;
}) {
  return (
    <div className="gradient-border rounded-xl p-4 hover-lift">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-primary font-serif">
        {animate ? (
          <>
            <AnimatedCounter value={value} />
            {suffix}
          </>
        ) : (
          `${value}${suffix}`
        )}
      </p>
    </div>
  );
}
