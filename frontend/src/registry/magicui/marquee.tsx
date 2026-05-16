import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: ReactNode;
}

function cloneMarqueeChildren(children: ReactNode, prefix: "a" | "b") {
  return Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ key?: string | number }>;
    const baseKey = el.key != null ? String(el.key) : String(index);
    return cloneElement(el, { key: `${prefix}-${baseKey}` });
  });
}

/**
 * Horizontal infinite marquee. Renders children twice with distinct keys so React
 * reconciles cleanly; translateX(-50%) loops seamlessly. Duration via
 * `className="[--duration:40s]"`.
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  ...props
}: MarqueeProps) {
  const firstPass = cloneMarqueeChildren(children, "a");
  const secondPass = cloneMarqueeChildren(children, "b");

  return (
    <div {...props} className={cn("group flex w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-stretch gap-[var(--gap,1rem)] will-change-transform",
          "animate-testimonial-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {firstPass}
        {secondPass}
      </div>
    </div>
  );
}
