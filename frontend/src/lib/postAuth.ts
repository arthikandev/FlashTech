import type { Industry } from "@/onboarding/types";
import { resolveCategoryDashboardPath } from "@/lib/categoryDashboardLink";
import type { CategoryCode } from "@/lib/categories/industryCategories";

const LAST_EMBED_KEY = "piq_last_embed_key";

export function getLastEmbedKey(): string | null {
  try {
    return localStorage.getItem(LAST_EMBED_KEY);
  } catch {
    return null;
  }
}

export function setLastEmbedKey(embedKey: string) {
  try {
    localStorage.setItem(LAST_EMBED_KEY, embedKey);
  } catch {
    /* ignore */
  }
}

export type ClientBusiness = {
  _id?: string;
  embedKey: string;
  name: string;
  industry?: Industry;
};

export type MembershipRow = {
  membership?: { role: "admin" | "viewer" };
  business: ClientBusiness | null;
};

export function isValidEmbedKey(key: string | null | undefined): boolean {
  const k = key?.trim();
  return Boolean(k && /^[a-z0-9-]+$/.test(k));
}

export function pickEmbedKey(memberships: MembershipRow[]): string {
  const withEmbed = memberships.filter((m) => m.business?.embedKey);
  const last = getLastEmbedKey();
  const match =
    withEmbed.find((m) => m.business!.embedKey === last) ?? withEmbed[0];
  const key = match.business!.embedKey;
  setLastEmbedKey(key);
  return key;
}

export function pickMemberEmbedKey(memberships: MembershipRow[] | undefined): string | null {
  const withEmbed = memberships?.filter((m) => m.business?.embedKey) ?? [];
  if (withEmbed.length === 0) return null;
  return pickEmbedKey(withEmbed);
}

export function hasMembershipForEmbedKey(
  memberships: MembershipRow[] | undefined,
  embedKey: string
): boolean {
  return (memberships ?? []).some((m) => m.business?.embedKey === embedKey);
}

export function resolveCanvasPath(
  memberships: MembershipRow[] | undefined,
  embedKey?: string | null
): string {
  const key =
    embedKey?.trim() ||
    (memberships?.length ? pickEmbedKey(memberships.filter((m) => m.business?.embedKey)) : null) ||
    getLastEmbedKey();
  if (key) {
    return `/canvas?embedKey=${encodeURIComponent(key)}`;
  }
  return "/canvas";
}

export type ClientAuthRow = {
  client: { onboardingComplete: boolean; categoryCode: CategoryCode } | null;
  business: { embedKey: string } | null;
};

/** Signed-in operator workspace (not marketing demo sites). */
export const CANVAS_PATH = "/canvas";

/** Where to send a signed-in user after login or SSO. */
export function resolvePostAuthPath(
  memberships: MembershipRow[] | undefined,
  clientRow?: ClientAuthRow | null
): string {
  const withEmbed = memberships?.filter((m) => m.business?.embedKey) ?? [];

  if (clientRow?.client === null && withEmbed.length === 0) {
    return "/client/setup";
  }

  if (withEmbed.length > 0) {
    const last = getLastEmbedKey();
    const match =
      withEmbed.find((m) => m.business!.embedKey === last) ?? withEmbed[0];
    if (match?.business?.embedKey) {
      setLastEmbedKey(match.business.embedKey);
      return resolveCategoryDashboardPath(
        match.business.embedKey,
        clientRow?.client?.categoryCode
      );
    }
  }

  return CANVAS_PATH;
}

/** @deprecated Use resolvePostAuthPath */
export function resolveDashboardPath(
  memberships: MembershipRow[] | undefined,
  clientRow?: ClientAuthRow | null
): string {
  return resolvePostAuthPath(memberships, clientRow);
}

export function canvasPathFromStorage(): string {
  const last = getLastEmbedKey();
  return last ? resolveCategoryDashboardPath(last) : "/canvas";
}

/** Map legacy `/dashboard/...` paths to `/canvas/...` preserving query. */
export function dashboardPathToCanvas(pathname: string, search: string): string {
  const canvasPath = pathname.replace(/^\/dashboard/, "/canvas") || "/canvas";
  return `${canvasPath}${search}`;
}
