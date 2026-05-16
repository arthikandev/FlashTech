import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Sheet } from "@/components/ui/Sheet";
import { clerkEnabled } from "@/convex/api";
import { KeywordTicker } from "../components/KeywordTicker";
import { WordsPullUp } from "../components/WordsPullUp";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

type NavLink =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const navItems: NavLink[] = [
  { label: "Our story", href: "#about" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Preview", href: "#preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Product", href: "#features" },
  { label: "Demos", to: "/demos/seylan" },
  { label: "Dashboard", to: "/dashboard" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const navLinkClass =
  "nav-link text-sm text-[#E1E0CC]/80 hover:text-[#E1E0CC] transition-colors";

function HeroNavAuth({ className = "" }: { className?: string }) {
  if (!clerkEnabled) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link to="/onboard" className={navLinkClass}>
          Sign in
        </Link>
        <Link
          to="/onboard"
          className="shimmer-btn rounded-full bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={navLinkClass}>
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="shimmer-btn rounded-full bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90"
          >
            Get started
          </button>
        </SignUpButton>
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map((item) =>
        item.to ? (
          <Link key={item.label} to={item.to} className={navLinkClass} onClick={onNavigate}>
            {item.label}
          </Link>
        ) : (
          <a key={item.label} href={item.href!} className={navLinkClass} onClick={onNavigate}>
            {item.label}
          </a>
        )
      )}
    </>
  );
}

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="min-h-[100dvh] p-3 sm:p-4 md:p-6">
      <motion.div
        className="relative flex min-h-[calc(100dvh-1.5rem)] sm:min-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl md:rounded-[2rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover brightness-[0.65]"
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="noise-overlay absolute inset-0 opacity-60 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85" />

        <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl text-primary tracking-tight shrink-0"
          >
            PresenceIQ
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-6 py-2.5">
            <NavLinks />
          </nav>

          <div className="hidden lg:flex items-center">
            <HeroNavAuth />
          </div>

          <button
            type="button"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#E1E0CC]"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
          <nav className="flex flex-col gap-4">
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            <div className="border-t border-[#212121] pt-4">
              <HeroNavAuth />
            </div>
          </nav>
        </Sheet>

        <div className="relative z-10 mt-auto flex flex-1 flex-col justify-end px-4 pb-8 sm:px-6 md:px-10 lg:px-12 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-7 xl:col-span-8">
              <WordsPullUp
                text="PresenceIQ"
                showAsterisk
                className="font-medium leading-[0.88] tracking-[-0.06em] text-[clamp(3.5rem,16vw,16rem)]"
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
                  Know every visitor before your AI speaks. Pre-conversation intelligence scores
                  intent, syncs CRM context, and personalises your Beyond Presence avatar in under
                  2 seconds.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/onboard"
                    className="glow-pulse shimmer-btn flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
                  >
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/demos/seylan"
                    className="flex w-full sm:w-auto items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] hover:border-primary/40 hover-lift transition-colors"
                  >
                    See live demo
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
