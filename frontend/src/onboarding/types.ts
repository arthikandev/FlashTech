export type Industry =
  | "bank"
  | "saas"
  | "hotel"
  | "hospital"
  | "ecommerce"
  | "hr";

export type CrmProvider = "hubspot" | "salesforce" | "zoho" | null;

export type OnboardingStepId =
  | "business"
  | "crm"
  | "avatar"
  | "ai-rules"
  | "install";

export type OnboardingData = {
  companyName: string;
  website: string;
  industry: Industry | "";
  crmProvider: CrmProvider;
  voice: string;
  personality: string;
  tone: string;
  greetingStyle: string;
  escalationRules: string;
  languages: string[];
  /** Beyond Presence managed agent id (from app.bey.chat). */
  bpAgentId: string;
  /** When true, do not overwrite BP agent system prompt on each session. */
  useNativeBpAgent: boolean;
};

export const ONBOARDING_STEPS: { id: OnboardingStepId; label: string }[] = [
  { id: "business", label: "Business" },
  { id: "crm", label: "CRM" },
  { id: "avatar", label: "Avatar" },
  { id: "ai-rules", label: "AI Rules" },
  { id: "install", label: "Install" },
];

export const defaultOnboardingData = (): OnboardingData => ({
  companyName: "",
  website: "",
  industry: "",
  crmProvider: null,
  voice: "professional",
  personality: "helpful",
  tone: "friendly",
  greetingStyle: "personalised",
  escalationRules: "",
  languages: ["English"],
  bpAgentId: "",
  useNativeBpAgent: false,
});
