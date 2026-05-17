import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { CategoryDashboardDef } from "./categoryDashboardRegistry";

type Props = {
  def: CategoryDashboardDef;
  embedKey: string;
};

export function CategorySidebarNav({ def, embedKey }: Props) {
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : `?embedKey=${encodeURIComponent(embedKey)}`;
  const base = `/canvas/dashboard`;

  const items = [...def.sidebar, ...def.sharedSidebar];

  return (
    <nav className="flex flex-col gap-0.5 border-r border-border bg-card/50 p-3 text-sm">
      {items.map((item) => {
        const to =
          item.path === ""
            ? `${base}${suffix}`
            : `${base}/${item.path}${suffix}`;
        return (
          <NavLink
            key={item.label}
            to={to}
            end={item.path === ""}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
