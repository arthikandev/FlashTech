import { CategoryDashboardCore, TopQuestionsList } from "../CategoryDashboardWidgets";

export function HotelsDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopQuestionsList
          title="Top booking questions"
          items={[
            { label: "Room availability Dec 24", count: 89 },
            { label: "Family package details", count: 47 },
            { label: "Airport transfer options", count: 32 },
          ]}
        />
        <TopQuestionsList
          title="Upsell opportunities"
          items={[
            { label: "Spa add-on", count: 24 },
            { label: "Dinner package", count: 18 },
          ]}
        />
      </div>
    </div>
  );
}
