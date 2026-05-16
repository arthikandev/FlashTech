import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { api, clerkEnabled } from "@/convex/api";
import { StepProgress } from "./components/StepProgress";
import {
  clearOnboardResult,
  loadOnboardResult,
  saveOnboardResult,
} from "./storage";
import { submitOnboardingToApi } from "./submitOnboarding";
import { useOnboarding } from "./useOnboarding";
import { AiRulesStep } from "./steps/AiRulesStep";
import { AvatarSetupStep } from "./steps/AvatarSetupStep";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { CrmIntegrationStep } from "./steps/CrmIntegrationStep";
import { InstallScriptStep } from "./steps/InstallScriptStep";

const ease = [0.16, 1, 0.3, 1] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function OnboardingPage() {
  const {
    step,
    stepIndex,
    steps,
    data,
    update,
    goNext,
    goBack,
    isFirst,
    direction,
  } = useOnboarding();

  const linkCurrentUser = useMutation(api.businessMembers.linkCurrentUser);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardResult, setOnboardResult] = useState(() => loadOnboardResult());

  const persistTenant = useCallback(
    async (options?: { force?: boolean }) => {
      if (!options?.force) {
        const existing = loadOnboardResult();
        if (existing) {
          setOnboardResult(existing);
          return existing;
        }
      } else {
        clearOnboardResult();
        setOnboardResult(null);
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await submitOnboardingToApi(data);
        saveOnboardResult(result);
        setOnboardResult(result);

        if (clerkEnabled) {
          try {
            await linkCurrentUser({ businessId: result.businessId, role: "admin" });
          } catch {
            /* tenant created; link from backend dashboard if Convex auth lags */
          }
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Onboarding failed";
        setSubmitError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, linkCurrentUser]
  );

  const handleAiRulesContinue = useCallback(async () => {
    try {
      await persistTenant();
      goNext();
    } catch {
      /* error surfaced via submitError */
    }
  }, [persistTenant, goNext]);

  const handleInstallRetry = useCallback(async () => {
    try {
      await persistTenant({ force: true });
    } catch {
      /* error surfaced via submitError */
    }
  }, [persistTenant]);

  useEffect(() => {
    if (step.id !== "install" || onboardResult || isSubmitting || submitError) {
      return;
    }
    void persistTenant().catch(() => {
      /* error surfaced via submitError */
    });
  }, [step.id, onboardResult, isSubmitting, submitError, persistTenant]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-20 mix-blend-overlay" />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-6 pb-4 max-w-3xl mx-auto w-full">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <AnimatedThemeToggler variant="circle" duration={450} />
      </header>

      <main className="relative z-10 flex-1 px-4 sm:px-8 pb-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            PresenceIQ
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-foreground">
            Set up PresenceIQ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {stepIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="mb-10">
          <StepProgress steps={steps} currentIndex={stepIndex} />
        </div>

        <div className="bg-card border border-border p-6 sm:p-8 shadow-sm">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease }}
            >
              {step.id === "business" && (
                <BusinessInfoStep
                  data={data}
                  update={update}
                  onBack={goBack}
                  onContinue={goNext}
                  showBack={!isFirst}
                />
              )}
              {step.id === "crm" && (
                <CrmIntegrationStep
                  data={data}
                  update={update}
                  onBack={goBack}
                  onContinue={goNext}
                  showBack={!isFirst}
                />
              )}
              {step.id === "avatar" && (
                <AvatarSetupStep
                  data={data}
                  update={update}
                  onBack={goBack}
                  onContinue={goNext}
                  showBack={!isFirst}
                />
              )}
              {step.id === "ai-rules" && (
                <AiRulesStep
                  data={data}
                  update={update}
                  onBack={goBack}
                  onContinue={() => void handleAiRulesContinue()}
                  showBack={!isFirst}
                  continueDisabled={isSubmitting}
                  continueLabel={isSubmitting ? "Creating workspace…" : undefined}
                />
              )}
              {step.id === "install" && (
                <InstallScriptStep
                  result={onboardResult}
                  error={submitError}
                  isLoading={isSubmitting}
                  onRetry={() => void handleInstallRetry()}
                  onBack={goBack}
                  showBack={!isFirst}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


