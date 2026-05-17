import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function SaasDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopQuestionsList
          title="Top feature questions"
          items={[
            { label: "How does X integrate with Y?", count: 52 },
            { label: "What's in the Pro tier?", count: 38 },
          ]}
        />
        <TopQuestionsList
          title="Pricing objections detected"
          items={[
            { label: '"Too expensive" mentioned', count: 14 },
            { label: "Comparing with competitor", count: 8 },
          ]}
        />
      </div>
    </div>
  );
}
