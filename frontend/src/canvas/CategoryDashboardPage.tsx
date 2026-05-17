import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { CategoryClientDashboardShell } from "@/dashboard/category/CategoryClientDashboardShell";
import { getCategoryDashboardDef } from "@/dashboard/category/categoryDashboardRegistry";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { SettingsPage } from "@/dashboard/pages/SettingsPage";
import { Card } from "@/components/ui/card";

function CategoryMainDashboard() {
  const category = useBusinessCategory();
  const def = getCategoryDashboardDef(category.code);
  const Main = def.Main;
  return <Main />;
}

function CategorySubpageStub({ title }: { title: string }) {
  return (
    <Card className="p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Category-specific view — connect analytics and CRM data in a future release.
      </p>
    </Card>
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
