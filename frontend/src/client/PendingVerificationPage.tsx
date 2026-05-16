import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

/** Stub until admin approval queue ships (spec §8). */
export function PendingVerificationPage() {
  return (
    <div className="brand-theme flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        PresenceIQ
      </p>
      <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
        Verification pending
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Your registration is queued for admin review. For the hackathon demo, accounts are approved
        automatically after onboarding — continue to your dashboard if you have already completed
        setup.
      </p>
      <Button render={<Link to="/dashboard" />}>Go to dashboard</Button>
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
        Back to home
      </Link>
    </div>
  );
}
