import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  text: string;
  className?: string;
  showAsterisk?: boolean;
};

export function WordsPullUp({ text, className = "", showAsterisk = false }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const words = text.split(" ");

  return (
    <h1 ref={ref} className={`text-foreground ${className}`}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;

        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-[0.2em]">
            <motion.span
              className="inline-block relative"
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {showAsterisk && isLast ? (
                <>
                  {word.slice(0, -1)}
                  <span className="relative inline-block">
                    {word.slice(-1)}
                    <span
                      className="absolute text-[0.31em] leading-none"
                      style={{ top: "0.65em", right: "-0.3em" }}
                    >
                      *
                    </span>
                  </span>
                </>
              ) : (
                word
              )}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}
