import { defaultOnboardingData, type OnboardingData } from "./types";

const COMPLETE_KEY = "piq_onboarding_complete";
const DRAFT_KEY = "piq_onboarding_draft";

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

export function loadDraft(): OnboardingData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultOnboardingData();
    return { ...defaultOnboardingData(), ...JSON.parse(raw) };
  } catch {
    return defaultOnboardingData();
  }
}

export function saveDraft(data: OnboardingData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(COMPLETE_KEY, "true");
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(COMPLETE_KEY);
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
