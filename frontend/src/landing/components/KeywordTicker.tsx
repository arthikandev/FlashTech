import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const KEYWORDS = ["Intent", "CRM", "Persona", "Opener", "Conversion"] as const;

export function KeywordTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % KEYWORDS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 min-h-[1.25rem]">
      <span className="text-gray-600">Powered by</span>
      <span className="inline-flex overflow-hidden h-[1.25em] align-middle">
        <AnimatePresence mode="wait">
          <motion.span
            key={KEYWORDS[index]}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-primary font-medium"
          >
            {KEYWORDS[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}
