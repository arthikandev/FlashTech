import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function BankingDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopQuestionsList
          title="Top inquiries today"
          items={[
            { label: "How to open a current account", count: 47 },
            { label: "Loan eligibility check", count: 31 },
            { label: "FD interest rates", count: 28 },
          ]}
        />
        <TopQuestionsList
          title="Churn risk alerts"
          items={[
            { label: "User asked about closing account", count: 5 },
            { label: "Complaints about service", count: 3 },
          ]}
        />
      </div>
    </div>
  );
}
