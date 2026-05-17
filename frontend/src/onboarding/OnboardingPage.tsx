import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/app-shell/AppShell";
import { api, clerkEnabled } from "@/convex/api";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { StepProgress } from "./components/StepProgress";
import {
  clearOnboardResult,
  loadOnboardResult,
  saveOnboardResult,
} from "./storage";
import {
  buildFinalizeOnboardingArgs,
  onboardResultFromFinalize,
  submitOnboardingToApi,
} from "./submitOnboarding";
import type { OnboardingData } from "./types";
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
  const finalizeOnboarding = useMutation(api.clients.finalizeOnboarding);
  const { client, business } = useCurrentClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardResult, setOnboardResult] = useState(() => loadOnboardResult());

  useEffect(() => {
    if (!client || !business) return;
    update({
      companyName: client.businessName || business.name,
      industry: business.industry as OnboardingData["industry"],
      website: "",
    });
  }, [client, business, update]);

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
        if (client && business) {
          const finalized = (await finalizeOnboarding(
            buildFinalizeOnboardingArgs(data, business._id)
          )) as { businessId: string; embedKey: string; categoryCode?: string };
          const result = onboardResultFromFinalize(
            finalized.businessId,
            finalized.embedKey,
            finalized.categoryCode ?? client.categoryCode
          );
          saveOnboardResult(result);
          setOnboardResult(result);
          return result;
        }

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
    [data, linkCurrentUser, finalizeOnboarding, client, business]
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
    <AppShell
      backTo="/login"
      title="Set up PresenceIQ"
      subtitle="Configure your workspace, avatar, and embed in a few steps."
      stepLabel={`Step ${stepIndex + 1} of ${steps.length}`}
    >
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
                  onContinue={client ? goNext : goNext}
                  showBack={!isFirst}
                  readOnly={Boolean(client)}
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
    </AppShell>
  );
}


