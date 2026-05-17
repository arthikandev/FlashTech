import type { ReactNode } from "react";
import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string; banner?: ReactNode };

export function EcommerceDashboard({ category, businessName, banner }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName} banner={banner}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Cart recovery funnel"
          description="Abandoned cart → avatar engagement → recovered checkout."
        />
        <PlaceholderPanel
          title="Top product inquiries"
          description="Most asked SKUs and category browse patterns today."
        />
        <PlaceholderPanel
          title="Active promotions"
          description="Promo code mentions and attributed conversions."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
