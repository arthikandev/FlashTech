import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function HealthcareDashboardMain() {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        Sensitive content flags: 3 (review)
      </div>
      <CategoryDashboardCore />
      <TopQuestionsList
        title="Top inquiry specialties"
        items={[
          { label: "Cardiology", count: 87 },
          { label: "Pediatrics", count: 64 },
          { label: "Orthopedics", count: 52 },
        ]}
      />
    </div>
  );
}
