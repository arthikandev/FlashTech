import type { Industry } from "@/onboarding/types";
import { isOnboardingComplete } from "@/onboarding/storage";

const LAST_EMBED_KEY = "piq_last_embed_key";

export function getLastEmbedKey(): string | null {
  try {
    return localStorage.getItem(LAST_EMBED_KEY);
  } catch {
    return null;
  }
}

export function setLastEmbedKey(embedKey: string): void {
  try {
    localStorage.setItem(LAST_EMBED_KEY, embedKey);
  } catch {
    /* ignore */
  }
}

export type ClientBusiness = {
  embedKey: string;
  name: string;
  industry?: Industry;
};

export type MembershipRow = {
  membership?: { role: "admin" | "viewer" };
  business: ClientBusiness | null;
};

/** Where to send a signed-in user after login or SSO. */
export function resolvePostAuthPath(memberships: MembershipRow[] | undefined): string {
  const hasBusiness = memberships?.some((m) => m.business?.embedKey);
  if (!hasBusiness) {
    return "/client/signup";
  }
  if (!isOnboardingComplete()) {
    return "/onboard";
  }
  const withEmbed = memberships!.filter((m) => m.business?.embedKey);
  const last = getLastEmbedKey();
  const match =
    withEmbed.find((m) => m.business!.embedKey === last) ?? withEmbed[0];
  if (match?.business?.embedKey) {
    setLastEmbedKey(match.business.embedKey);
  }
  return "/dashboard";
}

/** @deprecated Use resolvePostAuthPath */
export function resolveDashboardPath(memberships: MembershipRow[] | undefined): string {
  return resolvePostAuthPath(memberships);
}
