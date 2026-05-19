import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { LoanFunnelChart } from "../widgets/LoanFunnelChart";

export function BankingDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <LoanFunnelChart />
        <CategoryTopIntents
          code="BANKING_FINANCIAL"
          title="Top inquiries today"
        />
      </div>
    </div>
  );
}
