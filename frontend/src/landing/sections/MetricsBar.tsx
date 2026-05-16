import { motion, useReducedMotion } from "framer-motion";
import { MetricsPartnerStrip } from "@/landing/components/MetricsPartnerStrip";
import { PREVIEW_VIDEO_SRC } from "@/lib/previewVideo";

const ease = [0.16, 1, 0.3, 1] as const;

export function MetricsBar() {
  const reducesMotion = useReducedMotion();

  return (
    <section
      id="metrics-strip"
      className="relative overflow-hidden border-y border-[#1a1a1a] bg-black py-14 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <video
          className="absolute inset-y-[-12%] left-1/2 h-[130%] w-[min(110vw,920px)] -translate-x-1/2 scale-110 object-cover opacity-[0.18] saturate-[0.75] brightness-75 blur-[10px]"
          src={PREVIEW_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
      </div>
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/92 to-black" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(222,219,200,0.07),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={reducesMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
            Trusted stack
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg leading-snug tracking-tight text-[#E1E0CC] sm:text-xl md:text-2xl">
            Production-grade partners powering real-time inference, workflows, speech, and live
            video.
          </p>
        </motion.div>

        <motion.div
          initial={reducesMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease, delay: 0.06 }}
          className="pt-2 md:pt-4"
        >
          <p className="mb-7 text-center text-xs font-medium uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent sm:mb-8 sm:text-sm">
            Powered by
          </p>
          <MetricsPartnerStrip reducedMotion={!!reducesMotion} />
        </motion.div>
      </div>
    </section>
  );
}
