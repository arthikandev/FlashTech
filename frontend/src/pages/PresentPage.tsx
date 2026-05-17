import { Link } from "react-router-dom";
import { DashboardPageStandalone } from "@/dashboard/DashboardPage";
import { SlackMock } from "@/dashboard/SlackMock";
import { TenantProvider } from "@/tenant/TenantContext";

/** Split-screen presenter layout for live pitch (step 4 + 5). */
export function PresentPage() {
  return (
    <div className="brand-theme min-h-screen bg-black flex flex-col">
      <header className="border-b border-[#212121] px-4 py-3 flex items-center justify-between">
        <span className="font-serif text-primary">PresenceIQ · Presenter</span>
        <div className="flex gap-4 text-xs text-gray-500">
          <Link to="/demos/seylan" className="hover:text-primary" target="_blank">
            Open demo tab
          </Link>
          <Link to="/deck" className="hover:text-primary">
            Deck
          </Link>
          <Link to="/" className="hover:text-[#E1E0CC]">
            Home
          </Link>
        </div>
      </header>
      <div className="flex-1 grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#212121]">
        <div className="p-4 overflow-auto max-h-[calc(100vh-52px)]">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
            Live dashboard (step 5)
          </p>
          <TenantProvider>
            <DashboardPageStandalone />
          </TenantProvider>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(100vh-52px)] bg-[#0a0a0a]">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
            Slack hot-lead (step 4)
          </p>
          <SlackMock embedded />
        </div>
      </div>
    </div>
  );
}
