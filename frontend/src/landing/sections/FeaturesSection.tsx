import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  LayoutDashboard,
  Presentation,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FEATURES_VIDEO_SRC } from "@/lib/previewVideo";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const cardEase = [0.22, 1, 0.36, 1] as const;

function FeatureCard({
  children,
  index,
  className = "",
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: cardEase }}
      className={`hover-lift relative rounded-2xl overflow-hidden bg-[#212121] border border-[#212121] flex flex-col min-h-[240px] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ChecklistCard({
  index,
  number,
  title,
  icon: Icon,
  items,
  linkTo,
  learnMoreLabel,
  className = "",
}: {
  index: number;
  number: string;
  title: string;
  icon: LucideIcon;
  items: string[];
  linkTo: string;
  learnMoreLabel: string;
  className?: string;
}) {
  return (
    <FeatureCard index={index} className={className}>
      <div className="p-5 sm:p-6 flex flex-col h-full bg-[#101010]">
        <div className="flex items-start gap-4 mb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-600">{number}</p>
            <h3 className="text-[#E1E0CC] text-base sm:text-lg font-medium leading-snug">
              {title}
            </h3>
          </div>
        </div>
        <ul className="space-y-3 flex-1">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-xs sm:text-sm text-gray-400">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-primary text-xs sm:text-sm mt-4 hover:opacity-80"
        >
          {learnMoreLabel}
          <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
    </FeatureCard>
  );
}

export function FeaturesSection() {
  const { t } = useLandingLocale();

  return (
    <section id="features" className="section-pad relative bg-black px-4">
      <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("features.eyebrow")}
          title={t("features.title")}
          subtitle={t("features.subtitle")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 auto-rows-fr">
          <FeatureCard index={0} className="lg:col-span-7 lg:row-span-2 min-h-[320px] lg:min-h-[480px]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={FEATURES_VIDEO_SRC}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden />
            <p className="absolute bottom-5 left-5 right-5 text-[#E1E0CC] text-base sm:text-lg font-medium z-10">
              {t("features.videoCaption")}
            </p>
          </FeatureCard>

          <ChecklistCard
            index={1}
            number="01"
            title={t("features.c1.title")}
            icon={Code2}
            linkTo="/sites/seylan/index.html"
            className="lg:col-span-5"
            learnMoreLabel={t("features.learnMore")}
            items={[
              t("features.c1.i0"),
              t("features.c1.i1"),
              t("features.c1.i2"),
              t("features.c1.i3"),
            ]}
          />

          <ChecklistCard
            index={2}
            number="02"
            title={t("features.c2.title")}
            icon={LayoutDashboard}
            linkTo="/canvas"
            className="lg:col-span-5"
            learnMoreLabel={t("features.learnMore")}
            items={[t("features.c2.i0"), t("features.c2.i1"), t("features.c2.i2")]}
          />

          <ChecklistCard
            index={3}
            number="03"
            title={t("features.c3.title")}
            icon={Presentation}
            linkTo="/sites/seylan/index.html"
            className="lg:col-span-12"
            learnMoreLabel={t("features.learnMore")}
            items={[t("features.c3.i0"), t("features.c3.i1"), t("features.c3.i2")]}
          />
        </div>
      </div>
    </section>
  );
}
