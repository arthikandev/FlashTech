import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedLetter } from "../components/AnimatedLetter";

const ease = [0.16, 1, 0.3, 1] as const;

const OUTCOMES = [
  "Faster conversion — personalised openers from visit one",
  "Lower bounce — avatar speaks with CRM context immediately",
  "Higher CSAT — visitors feel recognised, not interrogated",
] as const;

const bodyText =
  "PresenceIQ is pre-conversation customer intelligence for enterprise AI avatars. When someone lands on your site, we fingerprint the visitor, fetch CRM via n8n, score intent with GPT-4o, and inject context into Beyond Presence — all before the avatar speaks.";

export function AboutSection() {
  return (
    <section id="about" className="section-pad bg-black px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
            Our story
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#E1E0CC] leading-[1.1]">
            We read the visitor before the avatar speaks.
          </h2>
          <ul className="mt-8 space-y-4">
            {OUTCOMES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/onboard"
            className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity"
          >
            Start building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          className="lg:col-span-7 relative rounded-2xl border border-[#212121] bg-[#101010]/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 gradient-mesh overflow-hidden"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <div
            className="intelligence-orb absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"
            aria-hidden
          />
          <AnimatedLetter
            text={bodyText}
            className="relative text-sm sm:text-base text-gray-400 leading-relaxed"
          />
        </motion.div>
      </div>
    </section>
  );
}
