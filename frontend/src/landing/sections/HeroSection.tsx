import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { clerkEnabled } from "@/convex/api";
import { CANVAS_PATH } from "@/lib/postAuth";
import { PREVIEW_VIDEO_SRC } from "@/lib/previewVideo";
import { KeywordTicker } from "../components/KeywordTicker";
import { LandingMobileMenu } from "../components/LandingMobileMenu";
import { LandingNavLinks } from "../components/LandingNavLinks";
import { WordsPullUp } from "../components/WordsPullUp";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import { useClerkUserButtonAppearance } from "@/auth/useClerkUserButtonAppearance";
import { LANDING_NAV_PILL_CLASS, NAV_LINK_CLASS } from "../nav";

const ease = [0.16, 1, 0.3, 1] as const;

const navLinkClass = NAV_LINK_CLASS;

function HeroNavAuth({ className = "" }: { className?: string }) {
  const { t } = useLandingLocale();
  const userButtonAppearance = useClerkUserButtonAppearance();

  if (!clerkEnabled) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link to="/login" className={navLinkClass}>
          {t("auth.signIn")}
        </Link>
        <Link
          to="/register"
          className="shimmer-btn rounded-full bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90"
        >
          {t("auth.getStarted")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SignedOut>
        <Link to="/login" className={navLinkClass}>
          {t("auth.signIn")}
        </Link>
        <Link
          to="/register"
          className="shimmer-btn rounded-full bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90"
        >
          {t("auth.getStarted")}
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" appearance={userButtonAppearance} />
      </SignedIn>
    </div>
  );
}

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLandingLocale();

  return (
    <section className="min-h-[100dvh] p-3 sm:p-4 md:p-6">
      <motion.div
        className="relative flex min-h-[calc(100dvh-1.5rem)] sm:min-h-[calc(100dvh-2rem)] w-full flex-col rounded-2xl md:rounded-[2rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl md:rounded-[2rem]"
          aria-hidden
        >
          <video
            className="absolute inset-0 h-full w-full object-cover brightness-[0.65]"
            src={PREVIEW_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="noise-overlay absolute inset-0 opacity-60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85" />
        </div>

        <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl text-primary tracking-tight shrink-0"
          >
            PresenceIQ
          </Link>

          <nav
            data-nav-pill
            className={cn(
              "hidden lg:flex min-w-0 max-w-[min(920px,calc(100vw-20rem))] items-center overflow-visible",
              LANDING_NAV_PILL_CLASS
            )}
            aria-label="Main"
          >
            <LandingNavLinks className="flex h-8 items-center gap-4 xl:gap-5 flex-nowrap" />
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher className="w-[9.5rem] shrink-0" />
            <HeroNavAuth />
          </div>

          <button
            type="button"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#E1E0CC]"
            onClick={() => setMenuOpen(true)}
            aria-label={t("hero.menuAria")}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <LandingMobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="relative z-10 mt-auto flex flex-1 flex-col justify-end overflow-visible px-4 pb-8 sm:px-6 md:px-10 lg:px-12 pt-8">
          <div className="grid grid-cols-1 items-end gap-8 overflow-visible lg:grid-cols-12 lg:gap-10">
            <div className="@container min-w-0 overflow-visible lg:col-span-7 xl:col-span-8">
              <WordsPullUp
                text="PresenceIQ"
                showAsterisk
                className="max-w-full font-medium leading-[0.88] tracking-[-0.04em] text-[clamp(3.5rem,18cqi,16rem)] lg:tracking-[-0.05em] lg:text-[clamp(3rem,min(16cqi,11.5rem),12rem)] xl:text-[clamp(3.5rem,min(17cqi,13.5rem),14rem)] 2xl:text-[clamp(4rem,min(18cqi,16rem),16rem)]"
              />
              <div className="mt-4 sm:mt-6">
                <KeywordTicker />
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <motion.div
                className="rounded-2xl border border-white/10 bg-black/55 backdrop-blur-md p-5 sm:p-6 md:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease }}
              >
                <p className="text-sm sm:text-base text-[#E1E0CC]/95 leading-relaxed">
                  {t("hero.tagline")}
                </p>
                <div className="mt-6">
                  {clerkEnabled ? (
                    <>
                      <SignedOut>
                        <Link
                          to="/sites/seylan/index.html"
                          className="flex w-full sm:w-auto items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] hover:border-primary/40 hover-lift transition-colors"
                        >
                          {t("auth.seeLiveDemo")}
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link
                          to={CANVAS_PATH}
                          className="flex w-full sm:w-auto items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm text-[#E1E0CC] hover:border-primary/60 hover-lift transition-colors"
                        >
                          {t("auth.openWorkspace")}
                        </Link>
                      </SignedIn>
                    </>
                  ) : (
                    <Link
                      to="/register"
                      className="flex w-full sm:w-auto items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] hover:border-primary/40 hover-lift transition-colors"
                    >
                      {t("auth.getStarted")}
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
