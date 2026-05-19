import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { ReturningGuestUpsellBoard } from "../widgets/ReturningGuestUpsellBoard";

export function HotelsDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <ReturningGuestUpsellBoard />
        <CategoryTopIntents
          code="HOTELS_TOURISM"
          title="Top booking & package intents"
        />
      </div>
    </div>
  );
}
