import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;
const SIDE_IMAGE = "/login-side-panel.png";

const ORBS: Array<{
  className: string;
  x: number[];
  y: number[];
  duration: number;
  delay: number;
}> = [
  {
    className: "left-[12%] top-[18%] h-32 w-32 sm:h-40 sm:w-40",
    x: [0, 18, -8, 0],
    y: [0, -14, 10, 0],
    duration: 22,
    delay: 0,
  },
  {
    className: "right-[8%] top-[42%] h-24 w-24 sm:h-28 sm:w-28",
    x: [0, -12, 16, 0],
    y: [0, 12, -8, 0],
    duration: 18,
    delay: 0.4,
  },
  {
    className: "bottom-[22%] left-[38%] h-20 w-20 sm:h-24 sm:w-24",
    x: [0, 10, -14, 0],
    y: [0, -10, 6, 0],
    duration: 26,
    delay: 0.8,
  },
];

const PARTICLES = [
  { left: "18%", top: "28%", size: 4, duration: 14, delay: 0 },
  { left: "72%", top: "35%", size: 3, duration: 11, delay: 0.6 },
  { left: "45%", top: "58%", size: 5, duration: 16, delay: 1.2 },
  { left: "82%", top: "62%", size: 3, duration: 13, delay: 0.3 },
  { left: "28%", top: "72%", size: 4, duration: 12, delay: 1.8 },
  { left: "58%", top: "22%", size: 3, duration: 15, delay: 0.9 },
] as const;

export function AuthSidePanel() {
  const reducesMotion = useReducedMotion();

  return (
    <div
      className="relative hidden h-full min-h-0 overflow-hidden bg-black lg:flex"
      aria-hidden
    >
      {/* Static hero image — never translated or scaled */}
      <img
        src={SIDE_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-[center_35%]"
        draggable={false}
      />

      {reducesMotion ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/35" />
      ) : (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease }}
          >
            <motion.div
              className="noise-overlay absolute inset-0 opacity-25 mix-blend-overlay"
              animate={{ opacity: [0.18, 0.28, 0.2, 0.18] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {ORBS.map((orb) => (
              <motion.div
                key={orb.className}
                className={`absolute rounded-full bg-[#dedbc8]/20 blur-3xl ${orb.className}`}
                animate={{
                  x: orb.x,
                  y: orb.y,
                  opacity: [0.35, 0.55, 0.4, 0.35],
                }}
                transition={{
                  duration: orb.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: orb.delay,
                }}
              />
            ))}

            {/* Warm light sweep — overlay only */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#dedbc8]/8 to-transparent"
              animate={{ opacity: [0.2, 0.45, 0.25, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute inset-0 overflow-hidden"
              aria-hidden
            >
              <motion.div
                className="absolute -inset-y-1/2 left-0 w-[45%] bg-gradient-to-r from-transparent via-[#dedbc8]/12 to-transparent blur-2xl"
                animate={{ x: ["-30%", "130%"] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
            </motion.div>

            {PARTICLES.map((p) => (
              <motion.span
                key={`${p.left}-${p.top}`}
                className="absolute rounded-full bg-[#dedbc8]/70 shadow-[0_0_12px_rgba(222,219,200,0.5)]"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                }}
                animate={{
                  y: [0, -18, -8, 0],
                  opacity: [0, 0.85, 0.4, 0],
                  scale: [0.6, 1, 0.8, 0.6],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
              />
            ))}

            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/35"
              animate={{ opacity: [0.88, 1, 0.92, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Soft vignette pulse */}
            <motion.div
              className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.35)]"
              animate={{ opacity: [0.6, 0.85, 0.65, 0.6] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
