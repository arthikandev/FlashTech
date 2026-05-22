import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReturningGuestUpsellBoard() {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.categoryStats.hotelsReturningGuests,
    businessId
      ? { businessId: businessId as unknown as string, limit: 8 }
      : "skip"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Returning guests · upsell board
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No returning guests yet. Connect Cloudbeds to enrich last-stay
            preferences, or wait for a visitor with returnCount &gt; 1.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rows.map((g) => (
              <li
                key={g.visitorId}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {g.name}{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({g.returnCount} visits · {g.language})
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.notes ?? g.lastPurchase ?? "No CRM notes yet"}
                  </p>
                </div>
                <time
                  className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                  dateTime={new Date(g.lastSeenAt).toISOString()}
                >
                  {new Date(g.lastSeenAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
