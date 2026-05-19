import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function outcomePill(outcome: string) {
  const color =
    outcome === "converted"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : outcome === "abandoned"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
      : "bg-muted text-muted-foreground";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}
    >
      {outcome}
    </span>
  );
}

export function CartRecoveryStream() {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.categoryStats.ecommerceCartStream,
    businessId
      ? { businessId: businessId as unknown as string, limit: 10 }
      : "skip"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Cart recovery stream
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cart-mention conversations yet. Connect Shopify to enrich with
            real cart contents and discount codes.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rows.map((r) => (
              <li
                key={r.conversationId}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground">
                    {r.snippet}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(r.endedAt).toLocaleString()}
                  </p>
                </div>
                {outcomePill(r.outcome)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
