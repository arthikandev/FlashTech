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

export type MembershipRow = {
  business: { embedKey: string; name: string } | null;
};

export function resolveDashboardPath(memberships: MembershipRow[] | undefined): string {
  const withEmbed = memberships?.filter((m) => m.business?.embedKey) ?? [];
  if (withEmbed.length === 0) {
    return "/onboard";
  }
  const last = getLastEmbedKey();
  const match =
    withEmbed.find((m) => m.business!.embedKey === last) ?? withEmbed[0];
  const key = match.business!.embedKey;
  setLastEmbedKey(key);
  return `/dashboard?embedKey=${encodeURIComponent(key)}`;
}
