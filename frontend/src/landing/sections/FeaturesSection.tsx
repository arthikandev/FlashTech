import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { WordsPullUpMultiStyle } from "../components/WordsPullUpMultiStyle";

const FEATURE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const ICON_EMBED =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85";
const ICON_DASHBOARD =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85";
const ICON_DEMOS =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85";

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
  icon,
  items,
  linkTo,
  className = "",
}: {
  index: number;
  number: string;
  title: string;
  icon: string;
  items: string[];
  linkTo: string;
  className?: string;
}) {
  return (
    <FeatureCard index={index} className={className}>
      <div className="p-5 sm:p-6 flex flex-col h-full bg-[#101010]">
        <img
          src={icon}
          alt=""
          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover mb-4"
        />
        <p className="text-[#E1E0CC] text-sm sm:text-base font-medium mb-4">
          <span className="text-gray-500 mr-2">{number}</span>
          {title}
        </p>
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
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <WordsPullUpMultiStyle
            className="flex flex-col gap-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal"
            segments={[
              {
                text: "Enterprise-grade intelligence for every visitor.",
                className: "text-primary",
              },
              {
                text: "Embed, score intent, and demo in real time.",
                className: "text-gray-500",
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 auto-rows-fr">
          <FeatureCard index={0} className="lg:col-span-7 lg:row-span-2 min-h-[320px] lg:min-h-[480px]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={FEATURE_VIDEO}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-[#E1E0CC] text-base sm:text-lg font-medium z-10">
              Your visitor&apos;s story starts here.
            </p>
          </FeatureCard>

          <ChecklistCard
            index={1}
            number="01"
            title="Embed SDK"
            icon={ICON_EMBED}
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
            icon={ICON_DASHBOARD}
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
            icon={ICON_DEMOS}
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
