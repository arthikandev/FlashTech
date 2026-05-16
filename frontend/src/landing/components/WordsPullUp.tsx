import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  text: string;
  className?: string;
  showAsterisk?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

function CharReveal({
  char,
  index,
  inView,
}: {
  char: string;
  index: number;
  inView: boolean;
}) {
  return (
    <span className="inline-block overflow-visible">
      <motion.span
        className="inline-block"
        initial={{ y: 24, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
        transition={{
          duration: 0.55,
          delay: index * 0.04,
          ease,
        }}
      >
        {char}
      </motion.span>
    </span>
  );
}

export function WordsPullUp({ text, className = "", showAsterisk = false }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const words = text.split(" ").filter(Boolean);
  const isSingleWord = words.length === 1;

  if (isSingleWord) {
    const word = words[0]!;
    const chars = showAsterisk ? word.slice(0, -1).split("") : word.split("");
    const lastChar = showAsterisk ? word.slice(-1) : null;

    return (
      <h1
        ref={ref}
        className={`whitespace-nowrap overflow-visible ${showAsterisk ? "pr-[0.4em]" : ""} ${className}`}
        style={{ color: "#E1E0CC" }}
      >
        {chars.map((char, i) => (
          <CharReveal key={`${char}-${i}`} char={char} index={i} inView={inView} />
        ))}
        {lastChar != null && (
          <span className="inline-block relative overflow-visible align-baseline">
            <CharReveal char={lastChar} index={chars.length} inView={inView} />
            <span
              className="absolute text-[0.31em] leading-none pointer-events-none"
              style={{ top: "0.55em", right: "-0.35em" }}
              aria-hidden
            >
              *
            </span>
          </span>
        )}
      </h1>
    );
  }

  return (
    <h1
      ref={ref}
      className={`whitespace-nowrap overflow-visible ${className}`}
      style={{ color: "#E1E0CC" }}
    >
      {words.map((word, i) => {
        const isLast = i === words.length - 1;

        return (
          <span key={`${word}-${i}`} className="inline-block overflow-visible mr-[0.2em]">
            <motion.span
              className="inline-block relative"
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease,
              }}
            >
              {showAsterisk && isLast ? (
                <>
                  {word.slice(0, -1)}
                  <span className="relative inline-block overflow-visible">
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
