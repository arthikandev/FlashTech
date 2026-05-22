/** Canonical six industry categories — single source for seed + industry mapping. */

export const CATEGORY_CODES = [
  "BANKING_FINANCIAL",
  "SAAS_SOFTWARE",
  "HOTELS_TOURISM",
  "HEALTHCARE",
  "ECOMMERCE_RETAIL",
  "HR_RECRUITMENT",
] as const;

export type CategoryCode = (typeof CATEGORY_CODES)[number];

export type IndustryKey =
  | "bank"
  | "saas"
  | "hotel"
  | "hospital"
  | "ecommerce"
  | "hr";

export type CategorySeedRow = {
  code: CategoryCode;
  industryKey: IndustryKey;
  name: string;
  tag: string;
  coreMetric: string;
  dashboardFocus: string;
  exampleClients: string[];
  sortOrder: number;
};

export const CATEGORY_SEED_ROWS: CategorySeedRow[] = [
  {
    code: "BANKING_FINANCIAL",
    industryKey: "bank",
    name: "Banking & Financial",
    tag: "Highest Value",
    coreMetric: "Qualified leads, churn risk, account-opening conversion",
    dashboardFocus:
      "Customer intelligence, lead scoring, churn alerts, product comparison analytics",
    exampleClients: [
      "Commercial Bank of Ceylon",
      "HNB Bank",
      "Sampath Bank",
      "NDB Bank",
      "Bank of Ceylon",
      "People's Bank",
    ],
    sortOrder: 1,
  },
  {
    code: "SAAS_SOFTWARE",
    industryKey: "saas",
    name: "SaaS & Software",
    tag: "Largest Market",
    coreMetric: "Trial-to-paid conversion, usage analytics, feature adoption",
    dashboardFocus: "Trial user behavior, pricing page interactions, churn prediction",
    exampleClients: ["CRM tools", "Project management apps", "Developer platforms"],
    sortOrder: 2,
  },
  {
    code: "HOTELS_TOURISM",
    industryKey: "hotel",
    name: "Hotels & Tourism",
    tag: "Strong for Demo",
    coreMetric: "Booking speed, upsell conversion, returning guest rate",
    dashboardFocus:
      "Guest preferences, room availability, package recommendations, multi-language support",
    exampleClients: ["Cinnamon Hotels", "Jetwing", "Aitken Spence", "Galle Face Hotel"],
    sortOrder: 3,
  },
  {
    code: "HEALTHCARE",
    industryKey: "hospital",
    name: "Hospitals & Healthcare",
    tag: "Local Relevance",
    coreMetric: "Multilingual intake accuracy, appointment efficiency, patient pre-briefing",
    dashboardFocus:
      "Appointment routing, doctor availability, language preferences, sensitive content handling",
    exampleClients: ["Nawaloka Hospital", "Asiri Hospital", "Lanka Hospitals", "Durdans"],
    sortOrder: 4,
  },
  {
    code: "ECOMMERCE_RETAIL",
    industryKey: "ecommerce",
    name: "E-commerce & Retail",
    tag: "High Volume",
    coreMetric: "Cart recovery rate, average order value, return customer rate",
    dashboardFocus:
      "Cart history, browse behavior, time-sensitive offers, product recommendations",
    exampleClients: ["Daraz", "Kapruka", "Wow.lk", "Glomark Online"],
    sortOrder: 5,
  },
  {
    code: "HR_RECRUITMENT",
    industryKey: "hr",
    name: "HR & Recruitment",
    tag: "Strong Story",
    coreMetric: "Screen speed, candidate quality, interview completion",
    dashboardFocus: "CV analysis, role matching, interview scheduling, candidate scoring",
    exampleClients: ["XpressJobs", "ikman Jobs", "HR consultancies", "Recruitment firms"],
    sortOrder: 6,
  },
];

const industryToCode = new Map(
  CATEGORY_SEED_ROWS.map((row) => [row.industryKey, row.code] as const)
);

const codeToIndustry = new Map(
  CATEGORY_SEED_ROWS.map((row) => [row.code, row.industryKey] as const)
);

export function categoryCodeFromIndustry(industry: IndustryKey): CategoryCode {
  return industryToCode.get(industry) ?? "BANKING_FINANCIAL";
}

export function industryFromCategoryCode(code: CategoryCode): IndustryKey {
  return codeToIndustry.get(code) ?? "bank";
}
