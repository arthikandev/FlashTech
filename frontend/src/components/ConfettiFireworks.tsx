import { Button } from "@/components/ui/Button";
import { fireConfettiFireworks } from "@/lib/confettiFireworks";

/** Manual trigger demo (e.g. dev / marketing). Prefer `fireConfettiFireworks()` after real auth/onboarding flows. */
export function ConfettiFireworks() {
  return (
    <div className="relative">
      <Button type="button" variant="outline" onClick={() => fireConfettiFireworks()}>
        Trigger fireworks
      </Button>
    </div>
  );
}
