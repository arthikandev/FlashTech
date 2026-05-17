import { useState } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Link, Outlet } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import { clerkEnabled } from "@/convex/api";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type NavLink = { type: "link"; to: string; label: string };
type NavDropdown = {
  type: "dropdown";
  label: string;
  children: { to: string; label: string; description?: string }[];
};

const APP_NAV: (NavLink | NavDropdown)[] = [
  { type: "link", to: "/", label: "Home" },
  { type: "link", to: "/canvas", label: "Workspace" },
  {
    type: "dropdown",
    label: "Live demos",
    children: [
      {
        to: "/demos/seylan",
        label: "Seylan Bank",
        description: "Banking — Sarangan pricing journey",
      },
      {
        to: "/demos/cloudmetrics",
        label: "CloudMetrics",
        description: "SaaS trial conversion",
      },
      {
        to: "/demos/coral",
        label: "Coral Resorts",
        description: "Hotel guest upsell",
      },
    ],
  },
  {
    type: "dropdown",
    label: "More",
    children: [
      { to: "/onboard", label: "Onboard" },
      { to: "/deck", label: "Deck" },
      { to: "/present", label: "Present" },
      { to: "/slack", label: "Slack" },
    ],
  },
];

function LayoutNavDropdown({
  item,
  onNavigate,
  className,
}: {
  item: NavDropdown;
  onNavigate?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "nav-link inline-flex items-center gap-1 hover:text-[#E1E0CC] transition-colors whitespace-nowrap",
          className
        )}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {item.label}
        <ChevronDown
          className={cn("size-3.5 opacity-70 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[11rem] rounded-xl border border-[#212121] bg-[#141414] py-1.5 px-1 shadow-xl">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC]"
            >
              <span className="font-medium text-[#E1E0CC]/90">{child.label}</span>
              {child.description ? (
                <span className="mt-0.5 block text-xs text-gray-500">{child.description}</span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuthActions({ compact }: { compact?: boolean }) {
  if (clerkEnabled) {
    return (
      <>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className={cn(
                "nav-link text-[#E1E0CC]/80 hover:text-[#E1E0CC] whitespace-nowrap",
                compact && "w-full text-left px-3 py-3 min-h-[44px]"
              )}
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className={cn(
                "shimmer-btn rounded-full bg-primary px-3 py-1 text-black text-xs font-medium hover:bg-primary/90 whitespace-nowrap",
                compact && "w-full mt-2 min-h-[44px] text-sm"
              )}
            >
              Get started
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </>
    );
  }

  return (
    <Link
      to="/onboard"
      className={cn(
        "shimmer-btn rounded-full bg-primary px-3 py-1 text-black text-xs font-medium",
        compact && "mt-2 block text-center py-3 text-sm min-h-[44px]"
      )}
    >
      Get started
    </Link>
  );
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="brand-theme min-h-screen flex flex-col bg-black">
      <header className="border-b border-[#212121] bg-[#101010]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-semibold text-primary tracking-tight font-serif text-lg shrink-0"
          >
            PresenceIQ
          </Link>

          <nav className="hidden lg:flex gap-x-4 text-xs sm:text-sm text-gray-500 items-center justify-end">
            {APP_NAV.map((entry) =>
              entry.type === "dropdown" ? (
                <LayoutNavDropdown key={entry.label} item={entry} />
              ) : (
                <Link
                  key={entry.to}
                  to={entry.to}
                  className="nav-link hover:text-[#E1E0CC] transition-colors whitespace-nowrap"
                >
                  {entry.label}
                </Link>
              )
            )}
            <AuthActions />
          </nav>

          <Button
            variant="ghost"
            className="lg:hidden min-h-[44px] min-w-[44px] p-2"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1 py-2">
          {APP_NAV.map((entry) =>
            entry.type === "dropdown" ? (
              <div key={entry.label} className="border-b border-[#212121] pb-2 mb-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {entry.label}
                </p>
                {entry.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC] min-h-[44px] flex flex-col justify-center"
                  >
                    {child.label}
                    {child.description ? (
                      <span className="text-xs text-gray-500">{child.description}</span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC] min-h-[44px] flex items-center"
              >
                {entry.label}
              </Link>
            )
          )}
          <div className="mt-4 pt-4 border-t border-[#212121] px-1">
            <AuthActions compact />
          </div>
        </nav>
      </Sheet>

      <main className="flex-1 w-full mx-auto px-4 py-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}
