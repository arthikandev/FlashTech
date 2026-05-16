import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string };

export function HealthcareDashboard({ category, businessName }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Appointment types"
          description="Distribution of consultation, follow-up, emergency, and diagnostic requests."
        />
        <PlaceholderPanel
          title="Language breakdown"
          description="Sinhala, Tamil, and English session share for multilingual intake."
        />
        <PlaceholderPanel
          title="Sensitive content flags"
          description="Moderation queue for flagged transcripts requiring staff review."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
