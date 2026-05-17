import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { CategoryDashboardDef } from "./categoryDashboardRegistry";

type Props = {
  def: CategoryDashboardDef;
  embedKey: string;
};

/** Horizontal section nav — avoids a second full-height sidebar inside canvas. */
export function CategoryDashboardTabs({ def, embedKey }: Props) {
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : `?embedKey=${encodeURIComponent(embedKey)}`;
  const base = `/canvas/dashboard`;
  const items = [...def.sidebar, ...def.sharedSidebar];

  return (
    <nav
      className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto border-b border-border px-1 pb-px"
      aria-label="Dashboard sections"
    >
      {items.map((item) => {
        const to =
          item.path === "" ? `${base}${suffix}` : `${base}/${item.path}${suffix}`;
        return (
          <NavLink
            key={item.label}
            to={to}
            end={item.path === ""}
            className={({ isActive }) =>
              cn(
                "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )
            }
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
