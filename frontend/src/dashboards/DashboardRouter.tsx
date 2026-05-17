import { Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useClientMembership } from "@/hooks/useClientMembership";
import { getCategoryByIndustry, getDashboardTemplate } from "@/lib/categories";
import { getSelectedIndustry, loadDraft } from "@/onboarding/storage";
import { BankingDashboard } from "./categories/BankingDashboard";
import { EcommerceDashboard } from "./categories/EcommerceDashboard";
import { HealthcareDashboard } from "./categories/HealthcareDashboard";
import { HotelsDashboard } from "./categories/HotelsDashboard";
import { HrDashboard } from "./categories/HrDashboard";
import { SaasDashboard } from "./categories/SaasDashboard";

function PreviewBanner() {
  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-dash-ink">
      <span>Preview mode — </span>
      <Link to="/onboard" className="font-medium text-primary underline-offset-2 hover:underline">
        complete onboarding
      </Link>
      <span> to save your workspace and get your embed script.</span>
    </div>
  );
}

type DashboardProps = {
  category: NonNullable<ReturnType<typeof getCategoryByIndustry>>;
  businessName: string;
  preview: boolean;
};

function CategoryDashboard({ category, businessName, preview }: DashboardProps) {
  const banner = preview ? <PreviewBanner /> : undefined;

  switch (getDashboardTemplate(category.industry)) {
    case "banking":
      return (
        <BankingDashboard category={category} businessName={businessName} banner={banner} />
      );
    case "saas":
      return <SaasDashboard category={category} businessName={businessName} banner={banner} />;
    case "hotels":
      return <HotelsDashboard category={category} businessName={businessName} banner={banner} />;
    case "healthcare":
      return (
        <HealthcareDashboard category={category} businessName={businessName} banner={banner} />
      );
    case "ecommerce":
      return (
        <EcommerceDashboard category={category} businessName={businessName} banner={banner} />
      );
    case "hr":
      return <HrDashboard category={category} businessName={businessName} banner={banner} />;
    default:
      return <Navigate to="/client/signup" replace />;
  }
}

export function DashboardRouter() {
  const { loading, business, category, authReady, signedIn } = useClientMembership();
  const draft = loadDraft();
  const selectedIndustry = business?.industry || getSelectedIndustry() || draft.industry;
  const previewCategory = getCategoryByIndustry(selectedIndustry);

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

  const preview = !business?.embedKey && Boolean(previewCategory);
  const activeCategory = preview ? previewCategory! : category;

  if (preview && activeCategory) {
    const name = draft.companyName.trim() || "Your workspace";
    return <CategoryDashboard category={activeCategory} businessName={name} preview />;
  }

  if (!business?.embedKey || !activeCategory) {
    return <Navigate to="/client/signup" replace />;
  }

  return (
    <CategoryDashboard
      category={activeCategory}
      businessName={business.name}
      preview={false}
    />
  );
}
