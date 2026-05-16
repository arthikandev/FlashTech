import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { clerkEnabled } from "@/convex/api";
import { AuthSidePanel } from "./AuthSidePanel";
import { authClerkAppearance } from "./clerkAppearance";

const ease = [0.16, 1, 0.3, 1] as const;

export function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="brand-theme fixed inset-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground lg:grid lg:grid-cols-2"
    >
      <div className="relative flex h-full min-h-0 flex-col border-r border-border bg-card">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 flex flex-1 flex-col"
        >
          <motion.div className="flex shrink-0 items-center justify-between px-6 pt-6 sm:px-10 lg:px-14">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Home
            </Link>
            <AnimatedThemeToggler variant="circle" duration={450} />
          </motion.div>

          <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-14">
            <motion.div className="mx-auto w-full max-w-[420px]">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                PresenceIQ
              </p>
              <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-[2.75rem]">
                Create account
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Start your workspace and deploy your AI avatar.
              </p>

              <div className="mt-9 flex flex-col gap-4">
                {!clerkEnabled ? (
                  <p className="text-sm text-muted-foreground">
                    Set <code className="text-foreground">VITE_CLERK_PUBLISHABLE_KEY</code> in{" "}
                    <code className="text-foreground">frontend/.env.local</code> to enable sign up.
                  </p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease, delay: 0.1 }}
                    className="auth-clerk-shell"
                  >
                    <SignUp
                      routing="path"
                      path="/register"
                      signInUrl="/login"
                      fallbackRedirectUrl="/onboard"
                      appearance={authClerkAppearance}
                    />
                  </motion.div>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <AuthSidePanel />
    </motion.div>
  );
}
