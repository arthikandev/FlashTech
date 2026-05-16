import { NavLink } from "react-router-dom";
import { MOBILE_TABS } from "./navConfig";
import { cn } from "@/lib/utils";

function tabClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex min-h-12 flex-1 flex-col items-center justify-center text-[10px] uppercase tracking-wide transition-colors",
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
  );
}

export function DashboardMobileNav() {
  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-sidebar/95 backdrop-blur-xl lg:hidden"
      aria-label="Dashboard navigation"
    >
      <div className="flex">
        {MOBILE_TABS.map((tab) => (
          <NavLink key={tab.href} to={tab.href} end={tab.end} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
