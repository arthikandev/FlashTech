import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { isOnboardingComplete } from "@/onboarding/storage";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Label } from "@/components/ui/label";
import { RippleButton } from "@/components/ui/ripple-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const SIDE_IMAGE = "/login-side-panel.png";

const inputClass = cn(
  "w-full h-[3.25rem] border-0 bg-secondary/90 dark:bg-muted",
  "text-foreground placeholder:text-muted-foreground text-base",
  "outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40 transition-shadow"
);

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function goAfterAuth() {
    navigate(isOnboardingComplete() ? "/dashboard" : "/onboarding", { replace: true });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      goAfterAuth();
    }, 600);
  }

  function handleGoogleSignIn() {
    goAfterAuth();
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-background text-foreground flex flex-col lg:grid lg:grid-cols-2">
      <div className="relative flex flex-col h-full min-h-0 border-r border-border bg-card-elevated">
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" />

        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-6 shrink-0 w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
          <AnimatedThemeToggler variant="circle" duration={450} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 flex flex-1 items-center justify-center min-h-0 overflow-y-auto px-6 sm:px-10 lg:px-14 py-10"
        >
          <div className="w-full max-w-[420px] mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              PresenceIQ
            </p>
            <h1 className="font-serif text-4xl sm:text-[2.75rem] leading-[1.05] tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Operator dashboard and live session intelligence.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5 w-full">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={cn(inputClass, "pl-12")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(inputClass, "pl-12 pr-12")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>

              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full h-[3.25rem] text-base font-semibold text-[var(--primary-foreground)]"
                background="var(--primary)"
                shimmerColor="var(--primary-foreground)"
                borderRadius="0"
                shimmerDuration="2.8s"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </ShimmerButton>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <p className="relative text-center text-xs uppercase tracking-widest text-muted-foreground bg-card-elevated px-3 w-fit mx-auto">
                or
              </p>
            </div>

            <RippleButton
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-[3.25rem] rounded-none border-border bg-card font-medium text-base"
              rippleColor="var(--primary)"
            >
              <GoogleIcon />
              Continue with Google
            </RippleButton>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              No account?{" "}
              <button type="button" className="text-primary hover:underline underline-offset-4">
                Request access
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative hidden lg:flex h-full min-h-0 overflow-hidden bg-black">
        <img
          src={SIDE_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />

        <div className="absolute top-8 xl:top-10 right-8 xl:right-10 max-w-md text-right border border-white/15 bg-black/40 backdrop-blur-md px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Live intelligence</p>
          <p className="text-xl font-medium text-white mt-2 leading-snug">
            Pre-conversation context in under 2s
          </p>
        </div>
      </div>
    </div>
  );
}
