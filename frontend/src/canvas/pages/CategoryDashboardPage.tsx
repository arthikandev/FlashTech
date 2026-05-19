import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { CategoryClientDashboardShell } from "@/dashboard/category/CategoryClientDashboardShell";
import { getCategoryDashboardDef } from "@/dashboard/category/categoryDashboardRegistry";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { SettingsPage } from "@/dashboard/pages/SettingsPage";
import type { CategoryCode } from "@/lib/categories/industryCategories";
import { CategoryTopIntents } from "@/dashboard/category/CategoryTopIntents";
import { LoanFunnelChart } from "@/dashboard/category/widgets/LoanFunnelChart";
import { TrialCohort } from "@/dashboard/category/widgets/TrialCohort";
import { ReturningGuestUpsellBoard } from "@/dashboard/category/widgets/ReturningGuestUpsellBoard";
import { MultilingualIntakeMatrix } from "@/dashboard/category/widgets/MultilingualIntakeMatrix";
import { CartRecoveryStream } from "@/dashboard/category/widgets/CartRecoveryStream";
import { CandidatePipelineKanban } from "@/dashboard/category/widgets/CandidatePipelineKanban";

function CategoryMainDashboard() {
  const category = useBusinessCategory();
  const def = getCategoryDashboardDef(category.code);
  const Main = def.Main;
  return <Main />;
}

function CategorySubpageStub({ title }: { readonly title: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Construction className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This view is industry-templated. Send a few scenarios to your live
        advisor and live data will populate here.
      </p>
    </div>
  );
}

type SubpageMap = Partial<Record<string, () => ReactNode>>;

const SUBPAGES: Record<CategoryCode, SubpageMap> = {
  BANKING_FINANCIAL: {
    leads: () => (
      <CategoryTopIntents code="BANKING_FINANCIAL" title="Lead pipeline" />
    ),
    churn: () => (
      <CategoryTopIntents code="BANKING_FINANCIAL" title="Churn signals" />
    ),
    products: () => (
      <CategoryTopIntents code="BANKING_FINANCIAL" title="Product inquiries" />
    ),
    loans: () => <LoanFunnelChart />,
    "fd-rates": () => (
      <CategoryTopIntents code="BANKING_FINANCIAL" title="FD rate inquiries" />
    ),
  },
  SAAS_SOFTWARE: {
    trials: () => <TrialCohort />,
    pricing: () => <TrialCohort />,
    features: () => (
      <CategoryTopIntents code="SAAS_SOFTWARE" title="Feature inquiries" />
    ),
    integrations: () => (
      <CategoryTopIntents code="SAAS_SOFTWARE" title="Integration questions" />
    ),
  },
  HOTELS_TOURISM: {
    bookings: () => (
      <CategoryTopIntents code="HOTELS_TOURISM" title="Booking inquiries" />
    ),
    returning: () => <ReturningGuestUpsellBoard />,
    packages: () => (
      <CategoryTopIntents code="HOTELS_TOURISM" title="Package performance" />
    ),
    languages: () => <MultilingualIntakeMatrix />,
  },
  HEALTHCARE: {
    appointments: () => (
      <CategoryTopIntents code="HEALTHCARE" title="Appointment queue" />
    ),
    specialties: () => <MultilingualIntakeMatrix />,
    languages: () => <MultilingualIntakeMatrix />,
    sensitive: () => (
      <CategoryTopIntents code="HEALTHCARE" title="Sensitive flags" />
    ),
  },
  ECOMMERCE_RETAIL: {
    "cart-recovery": () => <CartRecoveryStream />,
    products: () => (
      <CategoryTopIntents code="ECOMMERCE_RETAIL" title="Product inquiries" />
    ),
    returns: () => (
      <CategoryTopIntents code="ECOMMERCE_RETAIL" title="Return-customer chats" />
    ),
    promos: () => (
      <CategoryTopIntents code="ECOMMERCE_RETAIL" title="Promo performance" />
    ),
  },
  HR_RECRUITMENT: {
    pipeline: () => <CandidatePipelineKanban />,
    roles: () => (
      <CategoryTopIntents code="HR_RECRUITMENT" title="Role inquiries" />
    ),
    "cv-queue": () => (
      <CategoryTopIntents code="HR_RECRUITMENT" title="CV / skills feedback" />
    ),
    interviews: () => <CandidatePipelineKanban />,
    quality: () => <CandidatePipelineKanban />,
    skills: () => (
      <CategoryTopIntents code="HR_RECRUITMENT" title="Skill demand" />
    ),
  },
};

function SubpageBySlug() {
  const { section } = useParams();
  const category = useBusinessCategory();
  const label = section?.replace(/-/g, " ") ?? "Section";
  const title = label.charAt(0).toUpperCase() + label.slice(1);

  if (section === "avatar" || section === "team" || section === "billing") {
    return <SettingsPage hidePageHeader />;
  }
  if (section === "knowledge") {
    return <CategorySubpageStub title="Knowledge Base" />;
  }

  const widget = section ? SUBPAGES[category.code]?.[section] : undefined;
  if (widget) {
    return <div className="space-y-4">{widget()}</div>;
  }

  return <CategorySubpageStub title={title} />;
}

/** Category-templated client dashboard (one layout per categoryCode). */
export function CategoryDashboardPage() {
  return (
    <CategoryClientDashboardShell>
      <Routes>
        <Route index element={<CategoryMainDashboard />} />
        <Route path=":section" element={<SubpageBySlug />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </CategoryClientDashboardShell>
  );
}
