import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getDashboardHref } from "@/lib/dashboardLink";
import { WordsPullUp } from "../components/WordsPullUp";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

type NavLink = { label: string; href: string; to?: never } | { label: string; to: string; href?: never };

const ease = [0.16, 1, 0.3, 1] as const;

const staticNavItems: NavLink[] = [
  { label: "Our story", href: "#about" },
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Get started", to: "/login" },
  { label: "Stories", href: "#testimonials" },
];

export function HeroSection() {
  const navigate = useNavigate();
  const navItems: NavLink[] = [
    ...staticNavItems,
    { label: "Dashboard", href: getDashboardHref() },
  ];

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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, var(--hero-overlay-from), transparent, var(--hero-overlay-to))`,
          }}
        />

        <ShimmerButton
          type="button"
          onClick={() => navigate("/login")}
          className="absolute top-3 right-3 sm:top-4 sm:right-5 md:top-5 md:right-6 z-30 h-9 sm:h-10 px-4 sm:px-5 text-[10px] sm:text-xs md:text-sm font-semibold text-[var(--primary-foreground)] shadow-lg border-border/30"
          background="var(--primary)"
          shimmerColor="var(--primary-foreground)"
          borderRadius="9999px"
          shimmerDuration="2.5s"
        >
          Log in
        </ShimmerButton>

        <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <ul className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 bg-[var(--nav-pill)] border border-border rounded-b-2xl md:rounded-b-3xl px-3 py-2 md:px-5 shadow-lg backdrop-blur-md">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="text-[10px] sm:text-xs md:text-sm text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href!}
                    className="text-[10px] sm:text-xs md:text-sm text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            <li className="pl-1 sm:pl-2 border-l border-border ml-0.5 sm:ml-1">
              <AnimatedThemeToggler variant="circle" duration={450} />
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 lg:col-span-8">
              <WordsPullUp
                text="PresenceIQ"
                showAsterisk
                className="font-medium leading-[0.85] tracking-[-0.07em] text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] text-foreground drop-shadow-lg"
              />
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
              <motion.p
                className="text-foreground/70 text-xs sm:text-sm md:text-base drop-shadow-md"
                style={{ lineHeight: 1.2 }}
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
                  className="group inline-flex items-center gap-2 bg-primary text-[var(--primary-foreground)] font-medium text-sm sm:text-base rounded-full pl-5 pr-1.5 py-1.5 hover:gap-3 transition-all duration-300"
                >
                  See live demo
                  <span className="flex items-center justify-center bg-foreground rounded-full w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-4 h-4 text-background" />
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
