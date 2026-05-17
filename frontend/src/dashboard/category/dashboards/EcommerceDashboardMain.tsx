import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function EcommerceDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopQuestionsList
          title="Top products inquired"
          items={[
            { label: 'Samsung TV 55"', count: 124 },
            { label: "Kitchen appliances", count: 87 },
          ]}
        />
        <TopQuestionsList
          title="Active promotions performance"
          items={[{ label: "CODE25 — 142 mentions, 38 conversions", count: 38 }]}
        />
      </div>
    </div>
  );
}
