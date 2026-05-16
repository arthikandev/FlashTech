import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  className?: string;
};

/** Animates numeric portions of a stat string; leaves prefixes/suffixes static. */
export function AnimatedCounter({ value, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);

  if (!match) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr);
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

  return (
    <span ref={ref} className={className}>
      {prefix}
      <AnimatedNumber
        target={target}
        decimals={decimals}
        start={inView}
      />
      {suffix}
    </span>
  );
}

function AnimatedNumber({
  target,
  decimals,
  start,
}: {
  target: number;
  decimals: number;
  start: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [start, target]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));

  return (
    <motion.span
      initial={{ opacity: 0.4 }}
      animate={start ? { opacity: 1 } : { opacity: 0.4 }}
      transition={{ duration: 0.3 }}
    >
      {formatted}
    </motion.span>
  );
}
