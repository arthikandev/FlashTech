import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useLandingLocale } from "@/landing/i18n/LandingLocaleProvider";
import { LandingNavDropdown } from "@/landing/components/LandingNavDropdown";
import {
  LANDING_NAV_ENTRIES,
  LANDING_NAV_PILL_CLASS,
  NAV_LINK_CLASS,
  navLinkEmphasisClass,
  type NavLinkItem,
} from "@/landing/nav";
import { cn } from "@/lib/utils";

type Props = {
  /** When true, header sits inside the hero card (absolute). Otherwise fixed to viewport. */
  embedded?: boolean;
};

function NavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavLinkItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useLandingLocale();
  const base = cn(
    NAV_LINK_CLASS,
    navLinkEmphasisClass(item.emphasize),
    className
  );

  if (item.to) {
    return (
      <Link to={item.to} className={base} onClick={onNavigate}>
        {t(item.key)}
      </Link>
    );
  }

  return (
    <a href={item.href} className={base} onClick={onNavigate}>
      {t(item.key)}
    </a>
  );
}

export function LandingHeader({ embedded = false }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  const headerPosition = embedded
    ? "absolute top-0 left-0 right-0 z-30"
    : "fixed top-0 left-0 right-0 z-50";

  return (
    <>
      <header
        className={cn(
          headerPosition,
          "px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-5",
          "[padding-top:max(0.75rem,env(safe-area-inset-top))]"
        )}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="flex items-center gap-3 min-w-0 lg:justify-self-start">
            <button
              type="button"
              className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--nav-pill)]/90 backdrop-blur-md text-foreground shadow-sm"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link
              to="/"
              className="font-serif text-lg sm:text-xl text-foreground/95 hover:text-foreground transition-colors truncate"
            >
              PresenceIQ
            </Link>
          </div>

          <nav className="hidden lg:flex justify-self-center min-w-0 max-w-[min(920px,calc(100vw-22rem))]" aria-label="Main">
            <ul
              data-nav-pill
              className={cn(
                "flex min-w-0 items-center gap-4 xl:gap-5 overflow-visible",
                LANDING_NAV_PILL_CLASS
              )}
            >
              {LANDING_NAV_ENTRIES.map((entry) =>
                entry.type === "dropdown" ? (
                  <LandingNavDropdown
                    key={entry.key}
                    item={entry}
                    linkClassName={cn(NAV_LINK_CLASS, navLinkEmphasisClass(entry.emphasize))}
                  />
                ) : (
                  <li key={entry.key} className="shrink-0">
                    <NavLink item={entry} />
                  </li>
                )
              )}
              <li className="shrink-0 pl-2 ml-1 border-l border-white/14 flex items-center">
                <AnimatedThemeToggler variant="circle" duration={450} />
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-auto lg:justify-self-end lg:ml-0">
            <ShimmerButton
              type="button"
              onClick={() => navigate("/login")}
              className="h-9 sm:h-10 px-3 sm:px-5 text-[10px] sm:text-xs md:text-sm font-semibold text-[var(--primary-foreground)] shadow-lg border-border/30"
              background="var(--primary)"
              shimmerColor="var(--primary-foreground)"
              borderRadius="9999px"
              shimmerDuration="2.5s"
            >
              Log in
            </ShimmerButton>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <motion.nav
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[var(--nav-pill)] border-b border-border shadow-2xl backdrop-blur-xl pt-[max(1rem,env(safe-area-inset-top))] pb-6 px-5"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-serif text-xl text-foreground">Menu</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="flex flex-col gap-1">
                {LANDING_NAV_ENTRIES.map((entry, i) =>
                  entry.type === "dropdown" ? (
                    <motion.div
                      key={entry.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <LandingNavDropdown
                        item={entry}
                        variant="mobile"
                        wrapper="div"
                        onNavigate={closeMenu}
                      />
                    </motion.div>
                  ) : (
                    <motion.li
                      key={entry.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <NavLink
                        item={entry}
                        className="block py-3.5 text-base font-medium border-b border-border/60 last:border-0"
                        onNavigate={closeMenu}
                      />
                    </motion.li>
                  )
                )}
              </ul>
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Theme
                </span>
                <AnimatedThemeToggler variant="circle" duration={450} />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
