import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAudit() {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.audit.listForBusiness,
    businessId ? { businessId: businessId as unknown as string, limit: 100 } : "skip"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Audit log</CardTitle>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events yet. Actions in Admin (apply defaults, invite, rotate
            embed key) will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {rows.map((row) => (
              <li
                key={row._id}
                className="flex items-start justify-between gap-4 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{row.action}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.targetType}
                    {row.targetId ? ` · ${row.targetId}` : ""}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  dateTime={new Date(row.at).toISOString()}
                >
                  {new Date(row.at).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
