import { NavLink } from "react-router-dom";
import { MOBILE_TABS } from "./navConfig";

function tabClass({ isActive }: { isActive: boolean }) {
  return `flex-1 min-h-[48px] flex flex-col items-center justify-center text-[10px] uppercase tracking-wide transition-colors ${
    isActive ? "text-dash-accent" : "text-dash-muted hover:text-dash-ink"
  }`;
}

export function DashboardMobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-dash-border bg-dash-sidebar/95 backdrop-blur-xl"
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
