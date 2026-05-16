import { Link, Outlet } from "react-router-dom";
import {
  Building2,
  Home,
  LayoutDashboard,
  LogIn,
  Palmtree,
  TrendingUp,
} from "lucide-react";
import { AppMobileNav, type AppNavItem } from "@/components/AppMobileNav";

const nav: AppNavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/login", label: "Log in", icon: LogIn },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/demos/seylan", label: "Seylan", icon: Building2 },
  { to: "/demos/cloudmetrics", label: "CloudMetrics", icon: TrendingUp },
  { to: "/demos/coral", label: "Coral", icon: Palmtree },
];

export function Layout() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors">
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.2] mix-blend-overlay z-0" />

      <header className="sticky top-0 z-20 px-3 sm:px-4 pt-3 sm:pt-4 md:pt-6 pb-2 bg-background/90 backdrop-blur-md border-b border-border/60 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl md:text-2xl tracking-tight text-foreground hover:text-primary transition-colors shrink-0"
          >
            PresenceIQ
          </Link>
          <AppMobileNav items={nav} />
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-10 sm:pb-12 pt-4 sm:pt-6 md:pt-8">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border px-3 sm:px-4 py-5 sm:py-6 mt-auto bg-background/80 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest text-center sm:text-left">
          <span>PresenceIQ · Operator & demo views</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors normal-case tracking-normal"
          >
            <Home className="h-3 w-3" />
            Back to landing
          </Link>
        </div>
      </footer>
    </div>
  );
}
