import { Link } from "react-router-dom";
import type { IndustryCategory } from "@/lib/categories/industryCategories";
import { enrichCategoryFromDb, useCategoriesWithClients } from "@/hooks/useCategories";
import type { CategoryWithClients } from "@/convex/types";
import { CanvasSubpageHeader } from "../shell/CanvasSubpageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EnrichedCategory = IndustryCategory & {
  clientCount?: number;
  clients?: Array<{ _id: string; name: string; embedKey: string }>;
};

function CategoryCard({ category }: { category: EnrichedCategory }) {
  const Icon = category.icon;

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base">{category.name}</CardTitle>
              <CardDescription className="font-mono text-[11px]">
                {category.code}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
            {category.tag}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Core metric
          </p>
          <p className="mt-1 text-foreground">{category.coreMetric}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dashboard focus
          </p>
          <p className="mt-1 text-muted-foreground">{category.dashboardFocus}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Example clients
          </p>
          <p className="mt-1 text-muted-foreground">{category.exampleClients.join(" · ")}</p>
        </div>
        {category.clientCount != null ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Live clients in database
            </p>
            <p className="mt-1 font-medium text-foreground">{category.clientCount}</p>
            {category.clients && category.clients.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {category.clients.map((c) => (
                  <li key={c._id}>
                    <span className="text-foreground">{c.name}</span>
                    <span className="font-mono"> · {c.embedKey}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function toEnriched(row: CategoryWithClients): EnrichedCategory | null {
  const base = enrichCategoryFromDb(row);
  if (!base) return null;
  return { ...base, clientCount: row.clientCount, clients: row.clients };
}

export function CanvasCategoriesPage() {
  const categoriesDb = useCategoriesWithClients();
  const categories = categoriesDb
    ?.map(toEnriched)
    .filter((c): c is EnrichedCategory => c != null);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[960px] space-y-8 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader
          title="Industry categories"
          subtitle="Six fixed categories managed by platform admin. Each category shares one dashboard template; clients only see their own data."
        />

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">System hierarchy</CardTitle>
            <CardDescription>
              Platform admin → 6 categories → multiple clients per category → category-specific
              dashboard (same UI per category, isolated data per client).
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-xs leading-relaxed text-muted-foreground">
            <pre className="overflow-x-auto whitespace-pre">
{`Platform Admin
    └── 6 Fixed Categories
            └── Clients (e.g. HNB, Cinnamon, Daraz)
                    └── Category dashboard (your workspace data only)`}
            </pre>
          </CardContent>
        </Card>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold text-foreground">All categories</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Assign a category during onboarding or in workspace settings.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {categories === undefined ? (
              <>
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </>
            ) : (
              categories.map((cat) => <CategoryCard key={cat.code} category={cat} />)
            )}
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold text-foreground">Clients by category</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Reference examples plus workspaces stored in Convex.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Reference examples</TableHead>
                  <TableHead>Live clients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(categories ?? []).map((cat) => (
                  <TableRow key={cat.code}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cat.code}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.exampleClients.join(" · ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.clientCount ?? 0}
                      {cat.clients && cat.clients.length > 0
                        ? ` — ${cat.clients.map((c) => c.name).join(", ")}`
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link to="/canvas/settings?tab=business" />}>
            Workspace settings
          </Button>
          <Button variant="outline" size="sm" render={<Link to="/onboard" />}>
            Change category (onboard)
          </Button>
        </div>
      </div>
    </div>
  );
}
