import { getBackendBaseUrl, initBackendUrl } from "@/lib/backendUrl";
import type { OnboardingData } from "./types";

export type OnboardApiResult = {
  businessId: string;
  embedKey: string;
  embedSnippet: string;
  embedUrl?: string;
};

const LANGUAGE_CODES: Record<string, string> = {
  English: "en",
  Sinhala: "si",
  Tamil: "ta",
  Hindi: "hi",
  French: "fr",
  Spanish: "es",
};

function slugifyEmbedKeyFromName(companyName: string): string {
  const slug = companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return slug || "business";
}

export function buildOnboardRequestBody(data: OnboardingData) {
  if (!data.industry) {
    throw new Error("Industry is required");
  }
  if (!data.companyName.trim()) {
    throw new Error("Company name is required");
  }

  const primaryLanguage = data.languages[0] ?? "English";

  return {
    name: data.companyName.trim(),
    industry: data.industry,
    personaTone: `${data.personality}, ${data.tone}`,
    defaultLanguage: LANGUAGE_CODES[primaryLanguage] ?? "en",
    embedKey: slugifyEmbedKeyFromName(data.companyName),
  };
}

export async function submitOnboardingToApi(
  data: OnboardingData
): Promise<OnboardApiResult> {
  await initBackendUrl();
  const base = getBackendBaseUrl();

  const res = await fetch(`${base}/api/businesses/onboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildOnboardRequestBody(data)),
  });

  let body: { success?: boolean; message?: string; data?: OnboardApiResult };
  try {
    body = await res.json();
  } catch {
    throw new Error(
      res.ok ? "Invalid response from server" : `Request failed (${res.status})`
    );
  }

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? `Onboarding failed (${res.status})`);
  }

  const result = body.data;
  if (!result?.businessId || !result?.embedKey) {
    throw new Error("Invalid onboarding response from server");
  }

  return {
    businessId: result.businessId,
    embedKey: result.embedKey,
    embedSnippet: result.embedSnippet,
    embedUrl: result.embedUrl,
  };
}
