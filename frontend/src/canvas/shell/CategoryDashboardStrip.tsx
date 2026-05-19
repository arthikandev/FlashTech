import { CategoryDashboardBanner } from "@/components/categories/CategoryDashboardBanner";
import { useBusinessCategory } from "@/hooks/useBusinessCategory";
import { useDashboardContext } from "@/dashboard/context/DashboardContext";

/** Category context shown on analytics / settings dashboard subpages. */
export function CategoryDashboardStrip() {
  const { business } = useDashboardContext();
  const category = useBusinessCategory();

  return (
    <CategoryDashboardBanner category={category} clientName={business?.name} compact />
  );
}
