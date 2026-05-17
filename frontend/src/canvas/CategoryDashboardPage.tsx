import { Construction } from "lucide-react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { CategoryClientDashboardShell } from "@/dashboard/category/CategoryClientDashboardShell";
import { getCategoryDashboardDef } from "@/dashboard/category/categoryDashboardRegistry";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { SettingsPage } from "@/dashboard/pages/SettingsPage";

function CategoryMainDashboard() {
  const category = useBusinessCategory();
  const def = getCategoryDashboardDef(category.code);
  const Main = def.Main;
  return <Main />;
}

function CategorySubpageStub({ title }: { title: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Construction className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This section will show category-specific analytics and CRM data. Use Dashboard and
        Workspace settings for live configuration today.
      </p>
    </div>
  );
}

function SubpageBySlug() {
  const { section } = useParams();
  const label = section?.replace(/-/g, " ") ?? "Section";
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  if (section === "avatar" || section === "team" || section === "billing") {
    return <SettingsPage hidePageHeader />;
  }
  if (section === "knowledge") {
    return <CategorySubpageStub title="Knowledge Base" />;
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
