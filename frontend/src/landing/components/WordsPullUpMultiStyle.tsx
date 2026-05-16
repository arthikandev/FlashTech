import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export type TextSegment = {
  text: string;
  className?: string;
};

type Props = {
  segments: TextSegment[];
  className?: string;
};

export function WordsPullUpMultiStyle({ segments, className = "" }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const words = segments.flatMap((seg) =>
    seg.text.split(" ").map((word) => ({
      word,
      className: seg.className ?? "",
    }))
  );

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`}
    >
      {words.map(({ word, className: wordClass }, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            className={`inline-block ${wordClass}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
