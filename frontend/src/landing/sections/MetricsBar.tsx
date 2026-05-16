import { motion } from "framer-motion";

const METRICS = [
  { value: "<2s", label: "Intelligence pipeline" },
  { value: "30+", label: "Languages" },
  { value: "6", label: "Industries" },
  { value: "5", label: "Integrations" },
  { value: "99.9%", label: "Uptime SLA" },
] as const;

const POWERED_BY = ["Convex", "OpenAI", "Beyond Presence", "n8n", "ElevenLabs"] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export function MetricsBar() {
  return (
    <section className="section-pad bg-black border-y border-[#212121] px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 mr-2">
            Powered by
          </span>
          {POWERED_BY.map((name) => (
            <span
              key={name}
              className="rounded-full border border-[#212121] px-3 py-1 text-[10px] text-gray-400"
            >
              {name}
            </span>
          ))}
        </div>

        <motion.div
          className="flex items-stretch gap-0 overflow-x-auto pb-2 scrollbar-hide divide-x divide-[#212121]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5, ease }}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`flex flex-col items-center justify-center shrink-0 px-8 sm:px-12 ${
                i === 0 ? "pl-0" : ""
              }`}
            >
              <p className="font-serif text-3xl sm:text-4xl text-primary">{m.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-gray-500 text-center whitespace-nowrap">
                {m.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
