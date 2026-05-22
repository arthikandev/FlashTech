import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { CartRecoveryStream } from "../widgets/CartRecoveryStream";

export function EcommerceDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <CartRecoveryStream />
        <CategoryTopIntents
          code="ECOMMERCE_RETAIL"
          title="Top product & cart intents"
        />
      </div>
    </div>
  );
}
