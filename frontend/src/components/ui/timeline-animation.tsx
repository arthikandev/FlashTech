"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

type TimelineContentProps = {
  children: ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants: Variants;
  className?: string;
  as?: "div" | "p";
};

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as = "div",
}: TimelineContentProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const inView = useInView(timelineRef, { once: true, margin: "-80px" });

  const motionProps = {
    ref: localRef,
    custom: animationNum,
    initial: "hidden" as const,
    animate: inView ? ("visible" as const) : ("hidden" as const),
    variants: customVariants,
    className: cn(className),
  };

  if (as === "p") {
    return <motion.p {...motionProps}>{children}</motion.p>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}
