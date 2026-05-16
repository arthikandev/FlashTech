import type { Industry } from "./types";

export const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "bank", label: "Banking & finance" },
  { value: "saas", label: "SaaS" },
  { value: "hotel", label: "Hospitality" },
  { value: "hospital", label: "Healthcare" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "hr", label: "HR & recruiting" },
];

export const CRM_OPTIONS = [
  { id: "hubspot" as const, label: "HubSpot", description: "Sync contacts & deals" },
  { id: "salesforce" as const, label: "Salesforce", description: "Enterprise CRM pipeline" },
  { id: "zoho" as const, label: "Zoho", description: "CRM plus automation" },
];

export const VOICE_OPTIONS = [
  { value: "warm", label: "Warm" },
  { value: "professional", label: "Professional" },
  { value: "energetic", label: "Energetic" },
];

export const PERSONALITY_OPTIONS = [
  { value: "helpful", label: "Helpful" },
  { value: "consultative", label: "Consultative" },
  { value: "concise", label: "Concise" },
];

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "consultative", label: "Consultative" },
];

export const GREETING_STYLE_OPTIONS = [
  { value: "personalised", label: "Personalised (CRM-aware)" },
  { value: "generic", label: "Generic welcome" },
  { value: "returning", label: "Returning visitor first" },
];

export const LANGUAGE_OPTIONS = ["English", "Sinhala", "Tamil", "Hindi", "French", "Spanish"];

export function slugifyEmbedKey(companyName: string): string {
  const slug = companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) return "presenceiq-demo";
  return `${slug}-demo`;
}

export function buildEmbedSnippet(embedKey: string): string {
  const baseUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  return `<script src="${baseUrl}/api/embed/${embedKey}" async></script>`;
}
