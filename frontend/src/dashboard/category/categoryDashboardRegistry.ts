import type { CategoryCode } from "@/lib/categories/industryCategories";
import { getCategoryTopKpis } from "@/lib/categories/industryCategories";
import { BankingDashboardMain } from "./dashboards/BankingDashboardMain";
import { SaasDashboardMain } from "./dashboards/SaasDashboardMain";
import { HotelsDashboardMain } from "./dashboards/HotelsDashboardMain";
import { HealthcareDashboardMain } from "./dashboards/HealthcareDashboardMain";
import { EcommerceDashboardMain } from "./dashboards/EcommerceDashboardMain";
import { HrDashboardMain } from "./dashboards/HrDashboardMain";

export type CategorySidebarItem = {
  path: string;
  label: string;
};

export type CategoryDashboardDef = {
  code: CategoryCode;
  topKpis: ReturnType<typeof getCategoryTopKpis>;
  sidebar: CategorySidebarItem[];
  sharedSidebar: CategorySidebarItem[];
  Main: typeof BankingDashboardMain;
};

const SHARED: CategorySidebarItem[] = [
  { path: "knowledge", label: "Knowledge Base" },
  { path: "avatar", label: "Avatar Config" },
  { path: "team", label: "Team" },
  { path: "billing", label: "Billing" },
];

const REGISTRY: Record<CategoryCode, CategoryDashboardDef> = {
  BANKING_FINANCIAL: {
    code: "BANKING_FINANCIAL",
    topKpis: getCategoryTopKpis("BANKING_FINANCIAL"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "leads", label: "Lead Pipeline" },
      { path: "churn", label: "Churn Alerts" },
      { path: "products", label: "Product Inquiries" },
      { path: "loans", label: "Loan Analytics" },
      { path: "fd-rates", label: "FD Rate Inquiries" },
      { path: "branches", label: "Branch Activity" },
    ],
    sharedSidebar: SHARED,
    Main: BankingDashboardMain,
  },
  SAAS_SOFTWARE: {
    code: "SAAS_SOFTWARE",
    topKpis: getCategoryTopKpis("SAAS_SOFTWARE"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "trials", label: "Trial Users" },
      { path: "pricing", label: "Pricing Page Activity" },
      { path: "features", label: "Feature Adoption" },
      { path: "onboarding", label: "Onboarding Flow" },
      { path: "integrations", label: "Integration Inquiries" },
      { path: "api-docs", label: "API Documentation" },
    ],
    sharedSidebar: SHARED,
    Main: SaasDashboardMain,
  },
  HOTELS_TOURISM: {
    code: "HOTELS_TOURISM",
    topKpis: getCategoryTopKpis("HOTELS_TOURISM"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "bookings", label: "Booking Inquiries" },
      { path: "returning", label: "Returning Guests" },
      { path: "packages", label: "Package Performance" },
      { path: "rooms", label: "Room Type Demand" },
      { path: "languages", label: "Multilingual Stats" },
      { path: "local-foreign", label: "Local vs Foreign" },
    ],
    sharedSidebar: SHARED,
    Main: HotelsDashboardMain,
  },
  HEALTHCARE: {
    code: "HEALTHCARE",
    topKpis: getCategoryTopKpis("HEALTHCARE"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "appointments", label: "Appointment Queue" },
      { path: "doctors", label: "Doctor Availability" },
      { path: "specialties", label: "Specialty Demand" },
      { path: "languages", label: "Language Reports" },
      { path: "sensitive", label: "Sensitive Alerts" },
    ],
    sharedSidebar: SHARED,
    Main: HealthcareDashboardMain,
  },
  ECOMMERCE_RETAIL: {
    code: "ECOMMERCE_RETAIL",
    topKpis: getCategoryTopKpis("ECOMMERCE_RETAIL"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "cart-recovery", label: "Cart Recovery" },
      { path: "products", label: "Product Inquiries" },
      { path: "returns", label: "Return Customers" },
      { path: "recommendations", label: "Recommendation Engine" },
      { path: "promos", label: "Promo Performance" },
      { path: "delivery", label: "Delivery Inquiries" },
    ],
    sharedSidebar: SHARED,
    Main: EcommerceDashboardMain,
  },
  HR_RECRUITMENT: {
    code: "HR_RECRUITMENT",
    topKpis: getCategoryTopKpis("HR_RECRUITMENT"),
    sidebar: [
      { path: "", label: "Dashboard" },
      { path: "pipeline", label: "Candidate Pipeline" },
      { path: "roles", label: "Open Roles" },
      { path: "cv-queue", label: "CV Analysis Queue" },
      { path: "interviews", label: "Interview Schedule" },
      { path: "quality", label: "Quality Scores" },
      { path: "skills", label: "Skill Demand" },
    ],
    sharedSidebar: SHARED,
    Main: HrDashboardMain,
  },
};

export function getCategoryDashboardDef(code: CategoryCode): CategoryDashboardDef {
  return REGISTRY[code] ?? REGISTRY.BANKING_FINANCIAL;
}
