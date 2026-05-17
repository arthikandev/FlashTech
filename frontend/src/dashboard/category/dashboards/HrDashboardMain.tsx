import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function HrDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopQuestionsList
          title="Top open roles inquired"
          items={[
            { label: "Senior Engineer", count: 47 },
            { label: "Marketing Lead", count: 32 },
          ]}
        />
        <TopQuestionsList
          title="Most-asked skills"
          items={[
            { label: "React", count: 56 },
            { label: "AWS", count: 41 },
            { label: "SQL", count: 38 },
          ]}
        />
      </div>
    </div>
  );
}
