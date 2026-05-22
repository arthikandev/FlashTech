import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MultilingualIntakeMatrix() {
  const { businessId } = useTenant();
  const rows = useQuery(
    api.categoryStats.healthcareIntakeMatrix,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  const { languages, specialties, lookup, max } = useMemo(() => {
    const langs = Array.from(new Set((rows ?? []).map((r) => r.language)));
    const specs = Array.from(new Set((rows ?? []).map((r) => r.specialty)));
    const map = new Map<string, number>();
    let m = 0;
    for (const r of rows ?? []) {
      map.set(`${r.language}::${r.specialty}`, r.count);
      if (r.count > m) m = r.count;
    }
    return { languages: langs, specialties: specs, lookup: map, max: m };
  }, [rows]);

  function cellShade(count: number): string {
    if (count === 0 || max === 0) return "bg-muted/40 text-muted-foreground";
    const ratio = count / max;
    if (ratio > 0.66) return "bg-primary/80 text-primary-foreground";
    if (ratio > 0.33) return "bg-primary/50 text-foreground";
    return "bg-primary/25 text-foreground";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Multilingual intake matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No intake conversations yet. Specialties are detected from
            transcript keywords (cardio, ortho, pediatric, etc).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground">
                    Language ↓ / Specialty →
                  </th>
                  {specialties.map((sp) => (
                    <th
                      key={sp}
                      className="px-2 py-1 text-left font-medium text-muted-foreground"
                    >
                      {sp}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {languages.map((lang) => (
                  <tr key={lang}>
                    <td className="font-medium uppercase text-foreground">
                      {lang}
                    </td>
                    {specialties.map((sp) => {
                      const count = lookup.get(`${lang}::${sp}`) ?? 0;
                      return (
                        <td
                          key={sp}
                          className={`rounded px-2 py-1 text-center tabular-nums ${cellShade(
                            count
                          )}`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
