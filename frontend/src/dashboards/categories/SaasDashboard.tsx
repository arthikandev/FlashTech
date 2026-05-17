import type { ReactNode } from "react";
import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string; banner?: ReactNode };

export function SaasDashboard({ category, businessName, banner }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName} banner={banner}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Trial-to-paid funnel"
          description="Signup → Day 3 → Day 6 → Pricing page → Paid conversion."
        />
        <PlaceholderPanel
          title="Feature inquiry leaderboard"
          description="Most asked integration and tier comparison questions."
        />
        <PlaceholderPanel
          title="Pricing objections"
          description="Mentions of cost or competitor comparisons detected in transcripts."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
