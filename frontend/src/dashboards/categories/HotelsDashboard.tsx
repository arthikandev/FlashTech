import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string };

export function HotelsDashboard({ category, businessName }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Occupancy forecast"
          description="30-day heatmap of booking inquiries vs availability."
        />
        <PlaceholderPanel
          title="Package performance"
          description="Family, spa, and airport transfer upsell conversion rates."
        />
        <PlaceholderPanel
          title="Returning guests"
          description="Recognized visitors and personalized opener effectiveness."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
