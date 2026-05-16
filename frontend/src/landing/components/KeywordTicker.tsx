import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import type { MessageKey } from "../i18n/messages";

const KEYWORD_KEYS: MessageKey[] = [
  "ticker.intent",
  "ticker.crm",
  "ticker.persona",
  "ticker.opener",
  "ticker.conversion",
];

export function KeywordTicker() {
  const { t } = useLandingLocale();
  const keywords = useMemo(() => KEYWORD_KEYS.map((key) => t(key)), [t]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % keywords.length);
    }, 2500);
    return () => clearInterval(id);
  }, [keywords.length]);

  return (
    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 min-h-[1.25rem]">
      <span className="text-gray-600">{t("ticker.poweredBy")}</span>
      <span className="inline-flex overflow-hidden h-[1.25em] align-middle">
        <AnimatePresence mode="wait">
          <motion.span
            key={keywords[index]}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-primary font-medium"
          >
            {keywords[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}
