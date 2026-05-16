import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  Home,
  LayoutDashboard,
  LogIn,
  Palmtree,
  TrendingUp,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/login", label: "Log in", icon: LogIn },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/demos/seylan", label: "Seylan", icon: Building2 },
  { to: "/demos/cloudmetrics", label: "CloudMetrics", icon: TrendingUp },
  { to: "/demos/coral", label: "Coral", icon: Palmtree },
] as const;

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.2] mix-blend-overlay z-0" />

      <header className="sticky top-0 z-20 px-4 pt-4 md:pt-6 pb-2 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/"
            className="font-serif text-xl md:text-2xl tracking-tight text-foreground hover:text-primary transition-colors"
          >
            PresenceIQ
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 bg-card border border-border px-1.5 py-1.5">
            {nav.map((item) => {
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
                    "inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 transition-colors",
                    active
                      ? "bg-primary text-[var(--primary-foreground)] font-medium"
                      : "text-foreground/75 hover:text-foreground hover:bg-card-elevated/80"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <div className="pl-1 sm:pl-2 border-l border-border ml-0.5">
              <AnimatedThemeToggler variant="circle" duration={450} />
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12 pt-6 md:pt-8">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border px-4 py-6 mt-auto bg-background/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
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
