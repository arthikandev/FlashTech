import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { TopQuestionsList } from "./CategoryDashboardWidgets";

type Props = {
  readonly code: string;
  readonly title?: string;
  readonly limit?: number;
};

export function CategoryTopIntents({
  code,
  title = "Top inquiries",
  limit = 5,
}: Props) {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.categoryStats.getTopIntents,
    businessId
      ? { businessId: businessId as unknown as string, code, limit }
      : "skip"
  );

  const items =
    rows && rows.length > 0
      ? rows
      : [{ label: "No conversations scored yet", count: 0 }];

  return <TopQuestionsList title={title} items={items} />;
}
