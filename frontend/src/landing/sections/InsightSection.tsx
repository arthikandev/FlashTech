import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, MessageSquare, Sparkles, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const ease = [0.16, 1, 0.3, 1] as const;

const COMPARISON_ICONS = [Bot, MessageSquare, Sparkles, Users, Zap] as const;
const COMPARISON_KEY_PAIRS = [
  ["insight.c0.without", "insight.c0.with"],
  ["insight.c1.without", "insight.c1.with"],
  ["insight.c2.without", "insight.c2.with"],
  ["insight.c3.without", "insight.c3.with"],
  ["insight.c4.without", "insight.c4.with"],
] as const;

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

function ComparisonCard({
  icon: Icon,
  without,
  with: withText,
  withoutLabel,
  withLabel,
  index,
}: {
  icon: LucideIcon;
  without: string;
  with: string;
  withoutLabel: string;
  withLabel: string;
  index: number;
}) {
  const reducesMotion = useReducedMotion();

  return (
    <motion.article
      variants={cardVariants}
      whileHover={reducesMotion ? undefined : { y: -4, transition: { duration: 0.25 } }}
      className={cn(
        "group relative grid grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-[#212121]",
        "transition-shadow duration-300 hover:border-[#2a2a2a] hover:shadow-[0_20px_50px_-24px_rgba(222,219,200,0.2)]",
      )}
    >
      {/* Center divider pulse */}
      <motion.span
        className="pointer-events-none absolute bottom-4 top-4 left-1/2 z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#dedbc8]/35 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: index * 0.08 + 0.2, ease }}
        aria-hidden
      />

      <div className="relative bg-black/60 p-4 sm:p-5">
        <motion.div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600 transition-colors duration-300 group-hover:text-gray-500" />
          <span className="text-[10px] uppercase tracking-widest text-gray-600">{withoutLabel}</span>
        </motion.div>
        <p className="text-sm leading-relaxed text-gray-500">{without}</p>
      </div>

      <motion.div
        className="relative overflow-hidden border-l border-[#212121] bg-[#dedbc8]/5 p-4 sm:p-5"
        initial={reducesMotion ? false : { opacity: 0.85, x: 12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08 + 0.12, ease }}
      >
        {/* Shimmer sweep on reveal */}
        {!reducesMotion && (
          <motion.span
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#dedbc8]/10 to-transparent"
            initial={{ x: "-100%" }}
            whileInView={{ x: "120%" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, delay: index * 0.08 + 0.35, ease: "easeOut" }}
            aria-hidden
          />
        )}

        <div className="relative mb-3 flex items-center gap-2">
          <motion.span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dedbc8]/10"
            whileHover={reducesMotion ? undefined : { scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <Icon className="h-4 w-4 text-[#dedbc8]" aria-hidden />
          </motion.span>
          <span className="text-[10px] uppercase tracking-widest text-[#dedbc8]">
            {withLabel}
          </span>
        </div>
        <p className="relative text-sm leading-relaxed text-[#E1E0CC]">{withText}</p>
      </motion.div>
    </motion.article>
  );
}

export function InsightSection() {
  const { t } = useLandingLocale();
  const comparisons = useMemo(
    () =>
      COMPARISON_KEY_PAIRS.map(([withoutKey, withKey], i) => ({
        icon: COMPARISON_ICONS[i],
        without: t(withoutKey),
        with: t(withKey),
      })),
    [t],
  );

  return (
    <section id="insight" className="section-pad border-y border-[#212121] bg-[#101010] px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <SectionHeading
            eyebrow={t("insight.eyebrow")}
            title={t("insight.title")}
            subtitle={t("insight.subtitle")}
          />
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {comparisons.map((row, i) => (
            <ComparisonCard
              key={row.without}
              icon={row.icon}
              without={row.without}
              with={row.with}
              withoutLabel={t("insight.without")}
              withLabel={t("insight.with")}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
