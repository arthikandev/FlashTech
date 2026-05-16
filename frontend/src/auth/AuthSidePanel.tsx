import { motion, useReducedMotion } from "framer-motion";
import { Activity, Sparkles, Zap } from "lucide-react";
import { PREVIEW_VIDEO_SRC } from "@/lib/previewVideo";

const ease = [0.16, 1, 0.3, 1] as const;

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Sub-2s openers",
    body: "Pipeline personalizes every greeting before the avatar speaks.",
  },
  {
    icon: Activity,
    title: "Live intent scoring",
    body: "Hot leads surface in your operator dashboard in real time.",
  },
  {
    icon: Sparkles,
    title: "CRM-aware context",
    body: "Fingerprint → enrichment → session memory in one flow.",
  },
] as const;

export function AuthSidePanel() {
  const reducesMotion = useReducedMotion();

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease }}
      className="relative hidden h-full min-h-0 overflow-hidden bg-black lg:flex lg:flex-col"
      aria-label="PresenceIQ product preview"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="absolute inset-0 size-full object-cover brightness-[0.55] saturate-[1.05]"
          src={PREVIEW_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
        />
        <motion.div
          className="noise-overlay absolute inset-0 opacity-50 mix-blend-overlay"
          animate={
            reducesMotion
              ? undefined
              : { opacity: [0.35, 0.55, 0.4, 0.35] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-black/80"
          animate={
            reducesMotion
              ? undefined
              : { opacity: [0.92, 1, 0.94, 0.92] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        {!reducesMotion && (
          <>
            <motion.div
              className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-[#dedbc8]/15 blur-3xl"
              animate={{ x: [0, 24, -12, 0], y: [0, -18, 10, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-16 bottom-[28%] h-56 w-56 rounded-full bg-[#dedbc8]/10 blur-3xl"
              animate={{ x: [0, -20, 14, 0], y: [0, 12, -8, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 overflow-hidden"
              aria-hidden
            >
              <motion.div
                className="absolute -inset-y-1/2 left-0 w-[42%] bg-gradient-to-r from-transparent via-[#dedbc8]/10 to-transparent blur-2xl"
                animate={{ x: ["-35%", "125%"] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
              />
            </motion.div>
          </>
        )}
      </div>

      <motion.div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.15 }}
        >
          <p className="font-serif text-2xl tracking-tight text-primary xl:text-3xl">
            PresenceIQ
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
            Operator intelligence
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="max-w-md"
        >
          <h2 className="font-serif text-4xl leading-[1.08] tracking-tight text-[#e1e0cc] xl:text-[2.75rem]">
            Every visitor deserves a live, personal conversation.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#94a3b8]">
            Deploy your AI avatar with session memory, intent scoring, and CRM sync — from one
            operator dashboard.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.35 + i * 0.08 }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <item.icon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#e1e0cc]">{item.title}</p>
                  <p className="mt-1 text-sm leading-snug text-[#94a3b8]">{item.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
          className="text-xs text-[#6b7280]"
        >
          Trusted by growth teams running live avatar demos on their sites.
        </motion.p>
      </motion.div>
    </motion.aside>
  );
}
