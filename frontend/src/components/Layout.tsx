import { useState } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Link, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { clerkEnabled } from "@/convex/api";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/demos/seylan", label: "Seylan" },
  { to: "/demos/cloudmetrics", label: "CloudMetrics" },
  { to: "/demos/coral", label: "Coral" },
  { to: "/onboard", label: "Onboard" },
  { to: "/deck", label: "Deck" },
  { to: "/present", label: "Present" },
  { to: "/slack", label: "Slack" },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="border-b border-[#212121] bg-[#101010]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-semibold text-primary tracking-tight font-serif text-lg shrink-0"
          >
            PresenceIQ
          </Link>

          <nav className="hidden lg:flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 items-center justify-end">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link hover:text-[#E1E0CC] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            {clerkEnabled ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="nav-link text-[#E1E0CC]/80 hover:text-[#E1E0CC] whitespace-nowrap"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="shimmer-btn rounded-full bg-primary px-3 py-1 text-black text-xs font-medium hover:bg-primary/90 whitespace-nowrap"
                    >
                      Get started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : (
              <Link
                to="/onboard"
                className="shimmer-btn rounded-full bg-primary px-3 py-1 text-black text-xs font-medium"
              >
                Get started
              </Link>
            )}
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
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC] min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
          {!clerkEnabled && (
            <Link
              to="/onboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-3 text-center text-sm font-medium text-black min-h-[44px] flex items-center justify-center"
            >
              Get started
            </Link>
          )}
        </nav>
      </Sheet>

      <main className="flex-1 w-full mx-auto px-4 py-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}
