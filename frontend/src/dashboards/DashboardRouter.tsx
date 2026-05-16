import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useClientMembership } from "@/hooks/useClientMembership";
import { getDashboardTemplate } from "@/lib/categories";
import { BankingDashboard } from "./categories/BankingDashboard";
import { EcommerceDashboard } from "./categories/EcommerceDashboard";
import { HealthcareDashboard } from "./categories/HealthcareDashboard";
import { HotelsDashboard } from "./categories/HotelsDashboard";
import { HrDashboard } from "./categories/HrDashboard";
import { SaasDashboard } from "./categories/SaasDashboard";

export function DashboardRouter() {
  const { loading, business, category, authReady, signedIn } = useClientMembership();

  if (!authReady || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  if (!signedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!business?.embedKey || !category) {
    return <Navigate to="/client/signup" replace />;
  }

  const businessName = business.name;
  const template = getDashboardTemplate(business.industry);

  switch (template) {
    case "banking":
      return <BankingDashboard category={category} businessName={businessName} />;
    case "saas":
      return <SaasDashboard category={category} businessName={businessName} />;
    case "hotels":
      return <HotelsDashboard category={category} businessName={businessName} />;
    case "healthcare":
      return <HealthcareDashboard category={category} businessName={businessName} />;
    case "ecommerce":
      return <EcommerceDashboard category={category} businessName={businessName} />;
    case "hr":
      return <HrDashboard category={category} businessName={businessName} />;
    default:
      return <Navigate to="/client/signup" replace />;
  }
}
