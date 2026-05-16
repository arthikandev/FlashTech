import { motion } from "framer-motion";
import {
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "PresenceIQ surfaced Sarangan's return visits and plan comparisons before our avatar spoke — the opener felt genuinely personal.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    name: "Priya Mendis",
    role: "Head of Digital, Seylan Bank",
  },
  {
    text: "Embedding the SDK took one script tag. presenceiq:ready gave us visitor IDs instantly for our BeyondPresence pipeline.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    name: "James Okonkwo",
    role: "Solutions Architect",
  },
  {
    text: "The live dashboard updated on reload without refresh — perfect for our investor demo second screen.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    name: "Elena Vasquez",
    role: "Product Lead",
  },
  {
    text: "Intent scores and recommended actions in Convex made our hot-lead Slack workflow trivial to wire up.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    name: "Marcus Chen",
    role: "Automation Engineer",
  },
  {
    text: "Three demo tenants on one stack — bank, SaaS, hotel — let us pitch verticals without rebuilding the pipeline.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    name: "Aisha Rahman",
    role: "Demo Lead",
  },
  {
    text: "CRM context arrived before the call via n8n — the avatar greeted our prospect by name on the first line.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    name: "David Park",
    role: "Customer Success",
  },
  {
    text: "Fingerprint + page history in under two seconds. Exactly what we promised in the buildathon pitch.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    name: "Sofia Laurent",
    role: "CTO",
  },
  {
    text: "CloudMetrics demo site looked production-ready. Prospects believed it was a live product.",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop",
    name: "Omar Hassan",
    role: "Founder, CloudMetrics",
  },
  {
    text: "Session detail with transcript and sentiment arc closed the loop for our sales team after each call.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
    name: "Nina Kowalski",
    role: "Revenue Ops",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-20 md:py-28 relative w-full overflow-hidden">
      <div className="z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center">
            <div className="border border-border py-1 px-4 rounded-lg text-primary text-xs uppercase tracking-widest">
              Testimonials
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mt-5 text-foreground">
            What teams say
          </h2>
          <p className="mt-5 text-muted-foreground">
            Enterprise pilots using PresenceIQ embed and live dashboard.
          </p>
        </motion.div>
      </div>

      <div className="relative w-screen max-w-[100vw] ml-[calc(50%-50vw)]">
        <div
          className="flex justify-center gap-5 sm:gap-6 md:gap-8 px-4 sm:px-8 md:px-12 lg:px-20
            max-h-[min(820px,85vh)] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
