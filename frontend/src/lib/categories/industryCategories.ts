import {
  Building2,
  Code,
  Heart,
  Hotel,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Industry } from "@/onboarding/types";

export type CategoryCode =
  | "BANKING_FINANCIAL"
  | "SAAS_SOFTWARE"
  | "HOTELS_TOURISM"
  | "HEALTHCARE"
  | "ECOMMERCE_RETAIL"
  | "HR_RECRUITMENT";

export type IndustryCategory = {
  code: CategoryCode;
  /** Convex / API industry key */
  industryKey: Industry;
  name: string;
  tag: string;
  coreMetric: string;
  dashboardFocus: string;
  exampleClients: string[];
  icon: LucideIcon;
  demoTo: string;
  samplePrompt: string;
  statHighlight: string;
  description: string;
};

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  {
    code: "BANKING_FINANCIAL",
    industryKey: "bank",
    name: "Banking & Financial",
    tag: "Highest Value",
    coreMetric: "Qualified leads, churn risk, account-opening conversion",
    dashboardFocus: "Customer intelligence, lead scoring, churn alerts, product comparison analytics",
    exampleClients: [
      "Commercial Bank of Ceylon",
      "HNB Bank",
      "Sampath Bank",
      "NDB Bank",
      "Bank of Ceylon",
      "People's Bank",
    ],
    icon: Building2,
    demoTo: "/demos/seylan",
    samplePrompt:
      "A returning customer viewed pricing three times — greet them warmly and offer a plan comparison.",
    statHighlight: "2.1× qualified leads",
    description:
      "Avatar greets returning customers by name, detects churn risk or upsell opportunity, and routes them perfectly.",
  },
  {
    code: "SAAS_SOFTWARE",
    industryKey: "saas",
    name: "SaaS & Software",
    tag: "Largest Market",
    coreMetric: "Trial-to-paid conversion, usage analytics, feature adoption",
    dashboardFocus: "Trial user behavior, pricing page interactions, churn prediction",
    exampleClients: ["CRM tools", "Project management apps", "Developer platforms"],
    icon: Code,
    demoTo: "/demos/cloudmetrics",
    samplePrompt:
      "Trial user on day 6 comparing plans — open with usage-aware upgrade guidance.",
    statHighlight: "3× trial conversion",
    description:
      "Trial user on day 6 visits pricing — avatar knows usage data and converts with a targeted offer.",
  },
  {
    code: "HOTELS_TOURISM",
    industryKey: "hotel",
    name: "Hotels & Tourism",
    tag: "Strong for Demo",
    coreMetric: "Booking speed, upsell conversion, returning guest rate",
    dashboardFocus: "Guest preferences, room availability, package recommendations, multi-language support",
    exampleClients: ["Cinnamon Hotels", "Jetwing", "Aitken Spence", "Galle Face Hotel"],
    icon: Hotel,
    demoTo: "/demos/coral",
    samplePrompt:
      "Returning guest prefers ocean-view suite — suggest an upgrade with breakfast included.",
    statHighlight: "40% faster booking",
    description:
      "Returning guest greeted by name with room preferences and last-stay feedback. Upsells before they ask.",
  },
  {
    code: "HEALTHCARE",
    industryKey: "hospital",
    name: "Hospitals & Healthcare",
    tag: "Local Relevance",
    coreMetric: "Multilingual intake accuracy, appointment efficiency, patient pre-briefing",
    dashboardFocus: "Appointment routing, doctor availability, language preferences, sensitive content handling",
    exampleClients: ["Nawaloka Hospital", "Asiri Hospital", "Lanka Hospitals", "Durdans"],
    icon: Heart,
    demoTo: "/demos/coral",
    samplePrompt:
      "Patient prefers Tamil for a follow-up visit — open with empathetic intake in their language.",
    statHighlight: "Multilingual intake",
    description:
      "Patient avatar knows appointment type and preferred language. Care team gets a pre-brief from your webhook automations.",
  },
  {
    code: "ECOMMERCE_RETAIL",
    industryKey: "ecommerce",
    name: "E-commerce & Retail",
    tag: "High Volume",
    coreMetric: "Cart recovery rate, average order value, return customer rate",
    dashboardFocus: "Cart history, browse behavior, time-sensitive offers, product recommendations",
    exampleClients: ["Daraz", "Kapruka", "Wow.lk", "Glomark Online"],
    icon: ShoppingBag,
    demoTo: "/demos/coral",
    samplePrompt:
      "Cart abandoned with premium items — recover with a limited-time offer on their saved products.",
    statHighlight: "28% cart recovery",
    description:
      "Avatar knows cart history and browse behaviour. Greets with relevant suggestions and time-sensitive offers.",
  },
  {
    code: "HR_RECRUITMENT",
    industryKey: "hr",
    name: "HR & Recruitment",
    tag: "Strong Story",
    coreMetric: "Screen speed, candidate quality, interview completion",
    dashboardFocus: "CV analysis, role matching, interview scheduling, candidate scoring",
    exampleClients: ["XpressJobs", "ikman Jobs", "HR consultancies", "Recruitment firms"],
    icon: Users,
    demoTo: "/demos/cloudmetrics",
    samplePrompt:
      "Senior engineer candidate — open with a question tied to their latest project on the CV.",
    statHighlight: "50% faster screen",
    description:
      "Interview avatar knows the CV and role before the call. Opens with a personalised question.",
  },
];

const BY_INDUSTRY_KEY = new Map(
  INDUSTRY_CATEGORIES.map((c) => [c.industryKey, c] as const)
);

const BY_CODE = new Map(INDUSTRY_CATEGORIES.map((c) => [c.code, c] as const));

export function getCategoryByIndustry(industry?: string | null): IndustryCategory {
  const key = industry as Industry | undefined;
  if (key && BY_INDUSTRY_KEY.has(key)) {
    return BY_INDUSTRY_KEY.get(key)!;
  }
  return INDUSTRY_CATEGORIES[0];
}

export function getCategoryByCode(code: CategoryCode): IndustryCategory {
  return BY_CODE.get(code) ?? INDUSTRY_CATEGORIES[0];
}

export type CategoryTopKpi = { key: string; label: string };

export function getCategoryTopKpis(code: CategoryCode): CategoryTopKpi[] {
  switch (code) {
    case "BANKING_FINANCIAL":
      return [
        { key: "qualifiedLeads", label: "Qualified Leads" },
        { key: "churnRisk", label: "Churn Risk" },
        { key: "upsellOps", label: "Upsell Ops" },
      ];
    case "SAAS_SOFTWARE":
      return [
        { key: "trialsEngaged", label: "Trials Engaged" },
        { key: "conversions", label: "Conversions" },
        { key: "day6Visitors", label: "Day-6 Visitors" },
      ];
    case "HOTELS_TOURISM":
      return [
        { key: "bookingsToday", label: "Bookings Today" },
        { key: "avgSpeed", label: "Avg Speed" },
        { key: "upsells", label: "Upsells" },
      ];
    case "HEALTHCARE":
      return [
        { key: "appointments", label: "Appointments" },
        { key: "multilingual", label: "Multilingual" },
        { key: "preBriefs", label: "Pre-briefs" },
      ];
    case "ECOMMERCE_RETAIL":
      return [
        { key: "cartsRecovered", label: "Carts Recovered" },
        { key: "aov", label: "AOV" },
        { key: "recsAccepted", label: "Recs Accepted" },
      ];
    case "HR_RECRUITMENT":
      return [
        { key: "screened", label: "Screened" },
        { key: "avgTime", label: "Avg Time" },
        { key: "qualityScore", label: "Quality Score" },
      ];
    default:
      return [
        { key: "liveVisitors", label: "Live visitors" },
        { key: "conversations", label: "Conversations" },
        { key: "conversionRate", label: "Conversion" },
      ];
  }
}

export type CategoryKpiKey =
  | "liveVisitors"
  | "conversations"
  | "hotLeadRate"
  | "avgIntent"
  | "conversionRate";

export function getCategoryKpiLabels(industry?: string | null): Record<CategoryKpiKey, string> {
  const cat = getCategoryByIndustry(industry);
  switch (cat.code) {
    case "BANKING_FINANCIAL":
      return {
        liveVisitors: "Active prospects",
        conversations: "Advisor sessions",
        hotLeadRate: "Qualified lead rate",
        avgIntent: "Avg intent score",
        conversionRate: "Account-open rate",
      };
    case "SAAS_SOFTWARE":
      return {
        liveVisitors: "Trial visitors",
        conversations: "Product conversations",
        hotLeadRate: "Trial-to-paid signal",
        avgIntent: "Feature adoption score",
        conversionRate: "Conversion rate",
      };
    case "HOTELS_TOURISM":
      return {
        liveVisitors: "Active guests",
        conversations: "Concierge chats",
        hotLeadRate: "Booking intent rate",
        avgIntent: "Upsell opportunity",
        conversionRate: "Booking conversion",
      };
    case "HEALTHCARE":
      return {
        liveVisitors: "Patients today",
        conversations: "Intake sessions",
        hotLeadRate: "Appointment efficiency",
        avgIntent: "Intake accuracy",
        conversionRate: "Completed visits",
      };
    case "ECOMMERCE_RETAIL":
      return {
        liveVisitors: "Shoppers live",
        conversations: "Sales chats",
        hotLeadRate: "Cart recovery rate",
        avgIntent: "Avg order intent",
        conversionRate: "Return customer rate",
      };
    case "HR_RECRUITMENT":
      return {
        liveVisitors: "Candidates active",
        conversations: "Screening calls",
        hotLeadRate: "Quality match rate",
        avgIntent: "Candidate score",
        conversionRate: "Interview completion",
      };
    default:
      return {
        liveVisitors: "Live visitors",
        conversations: "AI conversations",
        hotLeadRate: "Hot lead rate",
        avgIntent: "Avg intent score",
        conversionRate: "Conversion rate",
      };
  }
}
