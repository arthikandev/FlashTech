import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { WordsPullUp } from "../components/WordsPullUp";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

type NavLink = { label: string; href: string; to?: never } | { label: string; to: string; href?: never };

const navItems: NavLink[] = [
  { label: "Our story", href: "#about" },
  { label: "Product", href: "#features" },
  { label: "Demos", to: "/demos/seylan" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Contact", href: "#features" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="noise-overlay absolute inset-0 opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="text-[10px] sm:text-xs md:text-sm transition-colors"
                    style={{ color: "rgba(225, 224, 204, 0.8)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")
                    }
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href!}
                    className="text-[10px] sm:text-xs md:text-sm transition-colors"
                    style={{ color: "rgba(225, 224, 204, 0.8)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")
                    }
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 lg:col-span-8">
              <WordsPullUp
                text="PresenceIQ"
                showAsterisk
                className="font-medium leading-[0.85] tracking-[-0.07em] text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]"
              />
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
              <motion.p
                className="text-primary/70 text-xs sm:text-sm md:text-base"
                style={{ lineHeight: 1.2, color: "rgba(222, 219, 200, 0.7)" }}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5, ease }}
              >
                The AI avatar that knows WHO you are before you speak. Pre-conversation
                intelligence, personalised in real time, for enterprise.
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.7, ease }}
              >
                <Link
                  to="/demos/seylan"
                  className="group inline-flex items-center gap-2 bg-primary text-black font-medium text-sm sm:text-base rounded-full pl-5 pr-1.5 py-1.5 hover:gap-3 transition-all duration-300"
                >
                  See live demo
                  <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
