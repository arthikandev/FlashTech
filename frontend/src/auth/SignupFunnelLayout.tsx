import type { ReactNode } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { clerkEnabled } from "@/convex/api";
import { cn } from "@/lib/utils";
import { AuthSidePanel } from "./AuthSidePanel";
import {
  SignupFunnelProgress,
  type SignupMacroStep,
} from "./SignupFunnelProgress";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  children: ReactNode;
  macroStep: SignupMacroStep;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  maxWidthClass?: string;
};

export function SignupFunnelLayout({
  children,
  macroStep,
  title,
  subtitle,
  backTo = "/",
  backLabel = "Home",
  maxWidthClass = "max-w-xl",
}: Props) {
  const location = useLocation();
  // If Clerk is enabled, funnel routes (e.g. /client/setup) require an authed user.
  // Send signed-out visitors to login while preserving where they were headed.
  const loginRedirect = `/login?redirect=${encodeURIComponent(
    location.pathname + location.search,
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="brand-theme fixed inset-0 flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-background text-foreground lg:grid lg:grid-cols-2"
    >
      {clerkEnabled ? (
        <SignedOut>
          <Navigate to={loginRedirect} replace />
        </SignedOut>
      ) : null}
      <motion.div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-r border-border bg-card lg:h-full lg:flex-none">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 flex min-h-0 flex-1 flex-col"
        >
          <div className="flex shrink-0 items-center justify-between px-6 pt-6 sm:px-10 lg:px-14">
            <Link
              to={backTo}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              {backLabel}
            </Link>
            <motion.div className="flex items-center gap-3">
              <AnimatedThemeToggler variant="circle" duration={450} />
              {clerkEnabled ? (
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              ) : null}
            </motion.div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 touch-pan-y sm:px-10 lg:px-14">
            <div className={cn("mx-auto w-full pb-4", maxWidthClass)}>
              <SignupFunnelProgress current={macroStep} className="mb-8" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                PresenceIQ
              </p>
              <h1 className="mt-3 font-serif text-3xl leading-[1.05] tracking-tight sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
              <motion.div className="mt-8">{children}</motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AuthSidePanel />
    </motion.div>
  );
}
