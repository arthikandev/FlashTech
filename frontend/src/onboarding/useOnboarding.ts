import { useCallback, useEffect, useState } from "react";
import { loadDraft, saveDraft } from "./storage";
import {
  ONBOARDING_STEPS,
  defaultOnboardingData,
  type OnboardingData,
  type OnboardingStepId,
} from "./types";

export function useOnboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => loadDraft());
  const [direction, setDirection] = useState<1 | -1>(1);

  const step = ONBOARDING_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    saveDraft(data);
  }, [data]);

  const update = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback((id: OnboardingStepId) => {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) {
      setDirection(idx > stepIndex ? 1 : -1);
      setStepIndex(idx);
    }
  }, [stepIndex]);

  const reset = useCallback(() => {
    const fresh = defaultOnboardingData();
    setData(fresh);
    setStepIndex(0);
    saveDraft(fresh);
  }, []);

  return {
    stepIndex,
    step,
    steps: ONBOARDING_STEPS,
    data,
    update,
    goNext,
    goBack,
    goTo,
    reset,
    isFirst,
    isLast,
    direction,
  };
}
