import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, Cloud, Palmtree } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  VerticalScrollMarquee,
  type VerticalScrollItem,
} from "@/components/ui/vertical-scroll-marquee";
import { cn } from "@/lib/utils";

const demos: (VerticalScrollItem & {
  to: string;
  tag?: string;
})[] = [
  {
    id: "seylan",
    label: "Seylan Bank",
    description: "Personal banking — Gold & Platinum plans",
    embedKey: "seylan-demo",
    to: "/demos/seylan",
    icon: Building2,
    tag: "Banking",
  },
  {
    id: "cloudmetrics",
    label: "CloudMetrics",
    description: "SaaS analytics — 14-day trial",
    embedKey: "cloudmetrics-demo",
    to: "/demos/cloudmetrics",
    icon: Cloud,
    tag: "SaaS",
  },
  {
    id: "coral",
    label: "Coral Resort",
    description: "Ocean suites & spa packages",
    embedKey: "coral-demo",
    to: "/demos/coral",
    icon: Palmtree,
    tag: "Hospitality",
  },
];

export function DemoSelectSection() {
  const [selected, setSelected] = useState("seylan");
  const active = demos.find((d) => d.id === selected) ?? demos[0];

  return (
    <section
      id="demos"
      className="relative bg-background px-3 sm:px-4 py-16 sm:py-20 md:py-28 transition-colors overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-primary text-xs uppercase tracking-[0.2em] mb-4">
            Choose your demo
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-tight px-2">
            Select an enterprise vertical
          </h2>
          <p className="text-muted-foreground text-base mt-3 max-w-lg mx-auto">
            Each site loads the embed SDK with a unique key. Pick one to explore live.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-10 md:mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-4">
            Scroll the strip — tap to select
          </p>
          <VerticalScrollMarquee
            items={demos}
            selectedId={selected}
            onSelect={setSelected}
            duration={32}
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-8">
          {demos.map((demo, index) => {
            const Icon = demo.icon;
            const isActive = selected === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => setSelected(demo.id)}
                className={cn(
                  "relative flex flex-col text-left border p-6 md:p-7 transition-all duration-300",
                  isActive
                    ? "border-primary/50 bg-card shadow-xl shadow-primary/10 md:scale-[1.02] z-10"
                    : "border-border bg-card/80 hover:border-primary/20 hover:bg-card"
                )}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {isActive && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary whitespace-nowrap">
                    Selected
                  </span>
                )}
                {demo.tag && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    {demo.tag}
                  </span>
                )}
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center border mb-4",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card-elevated text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-medium text-foreground">{demo.label}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                  {demo.description}
                </p>
                <p className="text-[10px] text-primary/70 mt-4 font-mono tracking-wide">
                  {demo.embedKey}
                </p>
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  <li className="flex items-center gap-2 text-xs text-foreground/85">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    Live embed SDK
                  </li>
                  <li className="flex items-center gap-2 text-xs text-foreground/85">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    Pre-conversation pipeline
                  </li>
                </ul>
              </button>
            );
          })}
        </div>

        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-primary/30 bg-card p-6 md:p-8"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">Ready to explore</p>
            <p className="text-xl font-medium text-foreground mt-1">{active.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{active.description}</p>
          </div>
          <Link
            to={active.to}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-[var(--primary-foreground)] font-semibold text-sm pl-5 pr-1.5 py-1.5 hover:gap-3 transition-all shrink-0"
          >
            Open {active.label}
            <span className="flex items-center justify-center bg-foreground w-9 h-9">
              <ArrowRight className="w-4 h-4 text-background" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
