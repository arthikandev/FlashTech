import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { PREVIEW_VIDEO_SRC } from "@/lib/previewVideo";
import { KeywordTicker } from "../components/KeywordTicker";
import { LandingMobileMenu } from "../components/LandingMobileMenu";
import { LandingNavLinks } from "../components/LandingNavLinks";
import { WordsPullUp } from "../components/WordsPullUp";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import { NAV_LINK_CLASS } from "../nav";

const ease = [0.16, 1, 0.3, 1] as const;

const navLinkClass = NAV_LINK_CLASS;

function HeroNavAuth({ className = "" }: { className?: string }) {
  const { t } = useLandingLocale();

  if (!clerkEnabled) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link to="/onboard" className={navLinkClass}>
          {t("auth.signIn")}
        </Link>
        <Link
          to="/onboard"
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
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: { avatarBox: "w-9 h-9 ring-2 ring-primary/30" },
          }}
        />
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
            className="hidden lg:flex min-w-0 max-w-[min(880px,calc(100vw-20rem))] items-center rounded-full border border-white/14 bg-black/45 px-4 py-2 md:px-5 md:py-2.5 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-x-auto scrollbar-hide"
            aria-label="Main"
          >
            <LandingNavLinks className="flex items-center gap-3 xl:gap-5 flex-nowrap px-1" />
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
                  <Link
                    to="/demos/seylan"
                    className="flex w-full sm:w-auto items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] hover:border-primary/40 hover-lift transition-colors"
                  >
                    {t("auth.seeLiveDemo")}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
