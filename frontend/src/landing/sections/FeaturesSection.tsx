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
  className = "",
}: {
  index: number;
  number: string;
  title: string;
  icon: LucideIcon;
  items: string[];
  linkTo: string;
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
          Learn more
          <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
    </FeatureCard>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="section-pad relative bg-black px-4">
      <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Product"
          title="Embed, score, and ship in one stack"
          subtitle="One script on your site, a live command centre for sessions, and branded demos that prove return-visitor intelligence."
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
              Your visitor&apos;s story starts here.
            </p>
          </FeatureCard>

          <ChecklistCard
            index={1}
            number="01"
            title="Embed SDK"
            icon={Code2}
            linkTo="/demos/seylan"
            className="lg:col-span-5"
            items={[
              "Fingerprint visitors on page load",
              "presenceiq:ready with visitor & session IDs",
              "Multi-site keys: Seylan, CloudMetrics, Coral",
              "One script tag — no frontend API code",
            ]}
          />

          <ChecklistCard
            index={2}
            number="02"
            title="Live dashboard"
            icon={LayoutDashboard}
            linkTo="/dashboard"
            className="lg:col-span-5"
            items={[
              "Real-time sessions via Convex",
              "Intent scores and personalised openers",
              "Session detail with transcript & actions",
            ]}
          />

          <ChecklistCard
            index={3}
            number="03"
            title="Demo sites"
            icon={Presentation}
            linkTo="/demos/seylan"
            className="lg:col-span-12"
            items={[
              "Three branded enterprise demos",
              "Reload shows return visitors instantly",
              "Second-screen ready for investor pitch",
            ]}
          />
        </div>
      </div>
    </section>
  );
}
