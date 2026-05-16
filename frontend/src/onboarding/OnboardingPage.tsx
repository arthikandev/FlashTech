import { AnimatePresence, motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { StepProgress } from "./components/StepProgress";
import { isOnboardingComplete } from "./storage";
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

  if (isOnboardingComplete()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="brand-theme min-h-[100dvh] bg-background text-foreground flex flex-col">
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
                  onContinue={goNext}
                  showBack={!isFirst}
                />
              )}
              {step.id === "install" && (
                <InstallScriptStep data={data} onBack={goBack} showBack={!isFirst} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
