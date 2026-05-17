import { motion, useInView, useReducedMotion } from "framer-motion";
import { Bot, Fingerprint, Sparkles, User, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const NODES: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Visitor lands", icon: User },
  { label: "Fingerprint", icon: Fingerprint },
  { label: "CRM enrichment", icon: Workflow },
  { label: "Intent scored", icon: Sparkles },
  { label: "Avatar speaks", icon: Bot },
];

function FlowConnector({ vertical }: { vertical: boolean }) {
  if (vertical) {
    return (
      <motion.div
        className="flex justify-center py-1 sm:hidden"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.4, ease }}
        aria-hidden
      >
        <svg width="2" height="28" className="overflow-visible">
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="28"
            stroke="rgba(222,219,200,0.25)"
            strokeWidth="2"
            strokeDasharray="4 6"
            className="flow-dash-line"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="hidden sm:flex flex-1 items-center justify-center min-w-[12px] max-w-[40px] px-0.5"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.4, ease }}
      aria-hidden
    >
      <svg width="100%" height="2" className="overflow-visible min-w-[16px]">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="rgba(222,219,200,0.25)"
          strokeWidth="2"
          strokeDasharray="4 6"
          className="flow-dash-line"
        />
      </svg>
    </motion.div>
  );
}

function FlowNode({
  label,
  icon: Icon,
  index,
  active,
  inView,
}: {
  label: string;
  icon: LucideIcon;
  index: number;
  active: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 shrink-0 w-full sm:flex-1 sm:min-w-0"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
    >
      <motion.div
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border bg-black/60 transition-colors duration-500",
          active
            ? "border-[#dedbc8]/50 glow-pulse bg-[#dedbc8]/10"
            : "border-[#212121]",
        )}
        animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Icon
          className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-500",
            active ? "text-[#e1e0cc]" : "text-gray-500",
          )}
          aria-hidden
        />
      </motion.div>
      <p
        className={cn(
          "text-center text-[10px] sm:text-[11px] leading-tight max-w-[5.5rem] sm:max-w-none transition-colors duration-500",
          active ? "text-[#e1e0cc]" : "text-gray-500",
        )}
      >
        {label}
      </p>
    </motion.div>
  );
}

export function AboutIntelligenceFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reducesMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducesMotion || !inView) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % NODES.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [reducesMotion, inView]);

  return (
    <motion.div
      ref={ref}
      className="relative min-h-[200px] sm:min-h-[160px] mb-6 sm:mb-8"
      role="img"
      aria-label="Pre-conversation intelligence flow: visitor, fingerprint, CRM, intent scoring, avatar"
    >
      {/* Mobile: vertical stack */}
      <div className="flex flex-col items-center sm:hidden">
        {NODES.map((node, i) => (
          <Fragment key={node.label}>
            <FlowNode
              label={node.label}
              icon={node.icon}
              index={i}
              active={!reducesMotion && activeIndex === i}
              inView={inView}
            />
            {i < NODES.length - 1 && <FlowConnector vertical />}
          </Fragment>
        ))}
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex sm:items-start w-full">
        {NODES.map((node, i) => (
          <Fragment key={node.label}>
            <FlowNode
              label={node.label}
              icon={node.icon}
              index={i}
              active={!reducesMotion && activeIndex === i}
              inView={inView}
            />
            {i < NODES.length - 1 && <FlowConnector vertical={false} />}
          </Fragment>
        ))}
      </div>

      {/* Traveling dot (horizontal, sm+) */}
      {!reducesMotion && inView && (
        <motion.div
          className="pointer-events-none absolute top-7 left-[10%] right-[10%] hidden sm:block h-0"
          aria-hidden
        >
          <motion.span
            className="absolute top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dedbc8] shadow-[0_0_12px_rgba(222,219,200,0.6)]"
            animate={{
              left: ["0%", "25%", "50%", "75%", "100%", "0%"],
            }}
            transition={{
              duration: 12.5,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
