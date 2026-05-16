import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { AboutIntelligenceFlow } from "../components/AboutIntelligenceFlow";
import { AnimatedLetter } from "../components/AnimatedLetter";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const ease = [0.16, 1, 0.3, 1] as const;

const OUTCOME_KEYS = ["about.outcome0", "about.outcome1", "about.outcome2"] as const;

export function AboutSection() {
  const { t } = useLandingLocale();
  const listRef = useRef<HTMLUListElement>(null);
  const listInView = useInView(listRef, { once: true, margin: "-80px" });

  return (
    <section id="about" className="section-pad bg-black px-4">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="lg:col-span-5">
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
            {t("about.eyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#E1E0CC] leading-[1.1]">
            {t("about.title")}
          </h2>
          <ul ref={listRef} className="mt-8 space-y-4">
            {OUTCOME_KEYS.map((key, i) => (
              <motion.li
                key={key}
                className="flex items-start gap-3 text-sm text-gray-400"
                initial={{ opacity: 0, x: -12 }}
                animate={listInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease }}
              >
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {t(key)}
              </motion.li>
            ))}
          </ul>
          <Link
            to="/onboard"
            className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity"
          >
            {t("about.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="lg:col-span-7 relative rounded-2xl border border-[#212121] bg-[#101010]/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 gradient-mesh overflow-hidden">
          <motion.div
            className="intelligence-orb absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"
            aria-hidden
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          />
          <AboutIntelligenceFlow />
          <motion.div
            className="relative border-t border-[#212121]/80 pt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            <AnimatedLetter
              text={t("about.body")}
              className="text-sm sm:text-base text-gray-400 leading-relaxed"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
