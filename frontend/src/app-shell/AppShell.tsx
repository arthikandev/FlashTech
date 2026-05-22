import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { clerkEnabled } from "@/convex/api";

type Props = {
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  stepLabel?: string;
};

export function AppShell({
  children,
  backTo = "/login",
  backLabel = "Back",
  title,
  subtitle,
  stepLabel,
}: Props) {
  return (
    <div className="brand-theme relative flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-20 mix-blend-overlay" />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-6 pb-4 max-w-3xl mx-auto w-full">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler variant="circle" duration={450} />
          {clerkEnabled ? (
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          ) : null}
        </div>
      </header>

      {(title || subtitle || stepLabel) && (
        <div className="relative z-10 px-4 sm:px-8 max-w-3xl mx-auto w-full mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            PresenceIQ
          </p>
          {title ? (
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-foreground">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          {stepLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">{stepLabel}</p>
          ) : null}
        </div>
      )}

      <main className="relative z-10 flex-1 px-4 sm:px-8 pb-10 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
