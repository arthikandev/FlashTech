import type { ReactNode } from "react";
import type { CategoryDefinition } from "@/lib/categories";
import { CategoryDashboardLayout } from "../shared/CategoryDashboardLayout";
import { PlaceholderPanel } from "../shared/PlaceholderPanel";

type Props = { category: CategoryDefinition; businessName: string; banner?: ReactNode };

export function BankingDashboard({ category, businessName, banner }: Props) {
  return (
    <CategoryDashboardLayout category={category} businessName={businessName} banner={banner}>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title="Conversation volume (7 days)"
          description="Line chart of visitor sessions and intent scores across branches."
        />
        <PlaceholderPanel
          title="Churn risk alerts"
          description="Users who mentioned closing accounts or service complaints in the last 24 hours."
        />
        <PlaceholderPanel
          title="Top inquiries today"
          description="Current account opening, loan eligibility, and FD rate questions ranked by volume."
        />
        <PlaceholderPanel
          title="Lead pipeline"
          description="Kanban: New → Contacted → Qualified → Converted."
        />
      </div>
    </CategoryDashboardLayout>
  );
}
