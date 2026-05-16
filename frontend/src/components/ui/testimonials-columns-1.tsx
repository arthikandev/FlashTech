import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={cn("w-full min-w-[280px] sm:min-w-[320px] max-w-lg shrink-0", props.className)}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-lg shadow-primary/10 w-full min-w-[280px] max-w-md sm:max-w-lg"
                key={`${index}-${i}`}
              >
                <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
                <div className="flex items-center gap-2 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium tracking-tight leading-5 text-foreground">
                      {name}
                    </span>
                    <span className="leading-5 opacity-60 tracking-tight text-muted-foreground text-sm">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
