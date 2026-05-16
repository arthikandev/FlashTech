import type { Industry } from "@/onboarding/types";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cloud,
  Hotel,
  HeartPulse,
  ShoppingBag,
  Users,
} from "lucide-react";

export type DashboardTemplate =
  | "banking"
  | "saas"
  | "hotels"
  | "healthcare"
  | "ecommerce"
  | "hr";

export type CategoryCode =
  | "BANKING_FINANCIAL"
  | "SAAS_SOFTWARE"
  | "HOTELS_TOURISM"
  | "HEALTHCARE"
  | "ECOMMERCE_RETAIL"
  | "HR_RECRUITMENT";

export type CategoryDefinition = {
  industry: Industry;
  code: CategoryCode;
  name: string;
  tag: string;
  description: string;
  dashboardTemplate: DashboardTemplate;
  icon: LucideIcon;
  coreMetric: string;
  mockKpis: { label: string; value: string; hint?: string }[];
  navItems: string[];
};

export const CATEGORIES: CategoryDefinition[] = [
  {
    industry: "bank",
    code: "BANKING_FINANCIAL",
    name: "Banking & Financial",
    tag: "Highest Value",
    description: "Lead scoring, churn alerts, and product comparison analytics.",
    dashboardTemplate: "banking",
    icon: Building2,
    coreMetric: "Qualified leads",
    mockKpis: [
      { label: "Qualified leads", value: "142", hint: "+12% vs last week" },
      { label: "Churn risk", value: "8", hint: "Needs review" },
      { label: "Upsell opportunities", value: "23" },
    ],
    navItems: [
      "Dashboard",
      "Lead Pipeline",
      "Churn Alerts",
      "Product Inquiries",
      "Loan Analytics",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
  {
    industry: "saas",
    code: "SAAS_SOFTWARE",
    name: "SaaS & Software",
    tag: "Largest Market",
    description: "Trial behavior, pricing interactions, and feature adoption.",
    dashboardTemplate: "saas",
    icon: Cloud,
    coreMetric: "Trial-to-paid conversion",
    mockKpis: [
      { label: "Trials engaged", value: "89" },
      { label: "Conversions", value: "24" },
      { label: "Day-6 visitors", value: "12", hint: "High intent" },
    ],
    navItems: [
      "Dashboard",
      "Trial Users",
      "Pricing Activity",
      "Feature Adoption",
      "Onboarding Flow",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
  {
    industry: "hotel",
    code: "HOTELS_TOURISM",
    name: "Hotels & Tourism",
    tag: "Strong for Demo",
    description: "Guest preferences, packages, and booking-speed insights.",
    dashboardTemplate: "hotels",
    icon: Hotel,
    coreMetric: "Booking conversion",
    mockKpis: [
      { label: "Bookings today", value: "23" },
      { label: "Avg booking speed", value: "3.2m" },
      { label: "Upsells", value: "14" },
    ],
    navItems: [
      "Dashboard",
      "Booking Inquiries",
      "Returning Guests",
      "Package Performance",
      "Room Demand",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
  {
    industry: "hospital",
    code: "HEALTHCARE",
    name: "Hospitals & Healthcare",
    tag: "Local Relevance",
    description: "Appointments, multilingual intake, and specialty routing.",
    dashboardTemplate: "healthcare",
    icon: HeartPulse,
    coreMetric: "Appointment efficiency",
    mockKpis: [
      { label: "Appointments", value: "56" },
      { label: "Multilingual", value: "78%", hint: "Of sessions" },
      { label: "Pre-briefs sent", value: "41" },
    ],
    navItems: [
      "Dashboard",
      "Appointment Queue",
      "Doctor Availability",
      "Specialty Demand",
      "Language Reports",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
  {
    industry: "ecommerce",
    code: "ECOMMERCE_RETAIL",
    name: "E-commerce & Retail",
    tag: "High Volume",
    description: "Cart recovery, browse behavior, and promo performance.",
    dashboardTemplate: "ecommerce",
    icon: ShoppingBag,
    coreMetric: "Cart recovery rate",
    mockKpis: [
      { label: "Carts recovered", value: "47" },
      { label: "Average order value", value: "Rs.6,800" },
      { label: "Recs accepted", value: "34%" },
    ],
    navItems: [
      "Dashboard",
      "Cart Recovery",
      "Product Inquiries",
      "Return Customers",
      "Promo Performance",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
  {
    industry: "hr",
    code: "HR_RECRUITMENT",
    name: "HR & Recruitment",
    tag: "Strong Story",
    description: "CV screening, role matching, and interview scheduling.",
    dashboardTemplate: "hr",
    icon: Users,
    coreMetric: "Screen speed",
    mockKpis: [
      { label: "Candidates screened", value: "142" },
      { label: "Avg screen time", value: "4.1m" },
      { label: "Quality score", value: "8.4", hint: "Out of 10" },
    ],
    navItems: [
      "Dashboard",
      "Candidate Pipeline",
      "Open Roles",
      "CV Analysis",
      "Interview Schedule",
      "Knowledge Base",
      "Avatar",
      "Team",
      "Billing",
    ],
  },
];

const BY_INDUSTRY = new Map(CATEGORIES.map((c) => [c.industry, c]));

export function getCategoryByIndustry(industry: Industry | "" | undefined): CategoryDefinition | undefined {
  if (!industry) return undefined;
  return BY_INDUSTRY.get(industry);
}

export function getDashboardTemplate(industry: Industry | "" | undefined): DashboardTemplate | undefined {
  return getCategoryByIndustry(industry)?.dashboardTemplate;
}

export const INDUSTRY_TO_CATEGORY = Object.fromEntries(
  CATEGORIES.map((c) => [c.industry, c])
) as Record<Industry, CategoryDefinition>;
