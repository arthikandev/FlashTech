import { defaultOnboardingData, type OnboardingData, type Industry } from "./types";
import type { OnboardApiResult } from "./submitOnboarding";

const COMPLETE_KEY = "piq_onboarding_complete";
const DRAFT_KEY = "piq_onboarding_draft";
const RESULT_KEY = "piq_onboarding_result";
const SELECTED_INDUSTRY_KEY = "piq_selected_industry";

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
    if (data.industry) {
      localStorage.setItem(SELECTED_INDUSTRY_KEY, data.industry);
    }
  } catch {
    /* ignore quota errors */
  }
}

export function setSelectedIndustry(industry: Industry): void {
  try {
    localStorage.setItem(SELECTED_INDUSTRY_KEY, industry);
    const draft = loadDraft();
    saveDraft({ ...draft, industry });
  } catch {
    /* ignore */
  }
}

export function getSelectedIndustry(): Industry | "" {
  try {
    const fromDraft = loadDraft().industry;
    if (fromDraft) return fromDraft;
    const raw = localStorage.getItem(SELECTED_INDUSTRY_KEY);
    if (!raw) return "";
    return raw as Industry;
  } catch {
    return "";
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(COMPLETE_KEY, "true");
    localStorage.removeItem(DRAFT_KEY);
    clearOnboardResult();
  } catch {
    /* ignore */
  }
}

export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(COMPLETE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(RESULT_KEY);
  } catch {
    /* ignore */
  }
}

export function saveOnboardResult(result: OnboardApiResult): void {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function loadOnboardResult(): OnboardApiResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardApiResult;
  } catch {
    return null;
  }
}

export function clearOnboardResult(): void {
  try {
    sessionStorage.removeItem(RESULT_KEY);
  } catch {
    /* ignore */
  }
}
