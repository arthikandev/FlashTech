import { motion } from "framer-motion";
import { Marquee } from "@/registry/magicui/marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import { cn } from "@/lib/utils";

type Review = {
  name: string;
  username: string;
  body: string;
  img: string;
};

const reviews: Review[] = [
  {
    name: "Priya Mendis",
    username: "@seylan_bank",
    body: "PresenceIQ surfaced return visits and plan comparisons before our avatar spoke — the opener felt genuinely personal.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
  },
  {
    name: "James Okonkwo",
    username: "@solutions_arch",
    body: "Embedding the SDK took one script tag. presenceiq:ready gave us visitor IDs instantly for our Beyond Presence pipeline.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
  {
    name: "Elena Vasquez",
    username: "@product_lead",
    body: "The live dashboard updated on reload without refresh — perfect for our investor demo second screen.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
  },
  {
    name: "Marcus Chen",
    username: "@automation_eng",
    body: "Intent scores and recommended actions in Convex made our hot-lead Slack workflow trivial to wire up.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
  },
  {
    name: "Aisha Rahman",
    username: "@demo_lead",
    body: "Three demo tenants on one stack — bank, SaaS, hotel — let us pitch verticals without rebuilding the pipeline.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
  },
  {
    name: "David Park",
    username: "@customer_success",
    body: "CRM context arrived before the call through our webhook automation — the avatar greeted our prospect by name on the first line.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
  },
];

/** Second row scrolls opposite direction with reversed order for visual variety. */
const rowTwoReviews = [...reviews].reverse();

function ReviewCard({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) {
  return (
    <figure
      className={cn(
        "relative flex h-full min-h-[9.5rem] w-[min(20rem,calc(100vw-2.5rem))] shrink-0 flex-col",
        "cursor-default overflow-hidden rounded-xl border px-5 py-4",
        "border-[#282828]/90 bg-[#0a0a0a]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-[border-color,background-color,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[#101010]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-black/80"
          alt=""
          src={img}
          loading="lazy"
          decoding="async"
        />
        <div className="flex min-w-0 flex-col text-left">
          <figcaption className="truncate text-sm font-medium text-[#e1e0cc]">{name}</figcaption>
          <p className="truncate text-xs text-gray-500">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 flex-1 border-l-2 border-primary/25 pl-3 text-sm leading-relaxed text-gray-400">
        {body}
      </blockquote>
    </figure>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;

export function TestimonialsSection() {
  const { t } = useLandingLocale();

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden border-y border-[#1a1a1a] bg-black py-20 md:py-28"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.07]" />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeading
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
          subtitle={t("testimonials.subtitle")}
        />
      </motion.div>

      <motion.div
        className="testimonial-marquee-viewport relative z-10 mt-2 flex w-full flex-col items-center justify-center gap-5 [--gap:1.25rem] md:gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
        viewport={{ once: true, margin: "-60px" }}
      >
        <Marquee pauseOnHover className="py-1 [--duration:52s]">
          {reviews.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="py-1 [--duration:58s]">
          {rowTwoReviews.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}
