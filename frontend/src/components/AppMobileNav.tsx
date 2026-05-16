import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

export type AppNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  items: readonly AppNavItem[];
  logoTo?: string;
};

export function AppMobileNav({ items, logoTo = "/" }: Props) {
  const { pathname } = useLocation();
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
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  return (
    <>
      <button
        type="button"
        className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-card text-foreground"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <nav className="hidden md:flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 bg-card border border-border px-1.5 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors",
                active
                  ? "bg-primary text-[var(--primary-foreground)] font-medium"
                  : "text-foreground/75 hover:text-foreground hover:bg-card-elevated/80"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <div className="pl-2 border-l border-border ml-0.5">
          <AnimatedThemeToggler variant="circle" duration={450} />
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-background/85 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 h-full w-[min(100%,20rem)] bg-card border-l border-border shadow-2xl flex flex-col pt-[max(1rem,env(safe-area-inset-top))] pb-8 px-5"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between mb-8">
                <Link
                  to={logoTo}
                  className="font-serif text-xl text-foreground"
                  onClick={closeMenu}
                >
                  PresenceIQ
                </Link>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-10 w-10 items-center justify-center border border-border bg-card-elevated"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.to === "/"
                      ? pathname === "/"
                      : pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={closeMenu}
                        className={cn(
                          "flex items-center gap-3 py-3.5 px-2 text-sm font-medium border-b border-border/50",
                          active
                            ? "text-primary"
                            : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
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
