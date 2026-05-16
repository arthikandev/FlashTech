import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string };

export function HrDashboard({ category, businessName }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Screening pipeline"
          description="Applied → Screened → Shortlisted → Interview → Hired."
        />
        <PlaceholderPanel
          title="Quality score distribution"
          description="Histogram of candidate match scores from CV analysis."
        />
        <PlaceholderPanel
          title="Open roles demand"
          description="Most inquired positions and skill keywords this week."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
