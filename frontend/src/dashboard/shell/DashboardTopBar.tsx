import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Bell, Menu, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clerkEnabled } from "@/convex/api";
import { useDashboardContext } from "../context/DashboardContext";
import { getPageTitle } from "./navConfig";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
  signedIn: boolean;
};

export function DashboardTopBar({
  search,
  onSearchChange,
  onOpenSidebar,
  onOpenNotifications,
  signedIn,
}: Props) {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);
  const {
    embedKey,
    embedOptions,
    onEmbedKeyChange,
    linking,
    linkError,
    linkToCurrentBusiness,
    needsMembership,
  } = useDashboardContext();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-dash-border bg-dash-sidebar/95 px-4 backdrop-blur-sm lg:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-dash-muted hover:bg-dash-hover hover:text-dash-ink lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block min-w-0">
        <p className="dash-label">Dashboard</p>
        <p className="text-sm font-medium text-dash-ink">{pageTitle}</p>
      </div>

      <label className="hidden md:flex items-center gap-2 text-xs text-dash-muted">
        <span className="sr-only">Workspace</span>
        <select
          value={embedKey}
          onChange={(e) => onEmbedKeyChange(e.target.value)}
          className="rounded-md border border-dash-border bg-dash-surface px-2 py-1.5 text-xs text-dash-ink focus:border-dash-accent focus:outline-none"
        >
          {embedOptions.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-1 max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sessions…"
            className="w-full rounded-md border border-dash-border bg-dash-surface py-2 pl-9 pr-3 text-sm text-dash-ink placeholder:text-dash-muted focus:border-dash-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-dash-positive">
          <span className="live-dot" />
          Live
        </span>

        {signedIn && needsMembership && (
          <button
            type="button"
            onClick={linkToCurrentBusiness}
            disabled={linking}
            className="hidden sm:inline rounded-md border border-dash-accent/40 px-2 py-1 text-[10px] text-dash-accent hover:bg-dash-accent/10"
          >
            {linking ? "Linking…" : "Link workspace"}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenNotifications}
          className="rounded-md p-2 text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Link
          to="/dashboard/settings"
          className="hidden sm:inline rounded-md px-2 py-1 text-[10px] text-dash-muted hover:text-dash-ink"
        >
          Settings
        </Link>

        {clerkEnabled && !signedIn ? (
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-md border border-dash-accent/40 px-3 py-1.5 text-xs text-dash-accent"
            >
              Sign in
            </button>
          </SignInButton>
        ) : clerkEnabled ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-accent/20 text-xs font-bold text-dash-accent">
            PIQ
          </span>
        )}
      </div>

      {linkError ? (
        <p className="absolute left-4 right-4 top-full mt-1 text-xs text-rose-400" role="alert">
          {linkError}
        </p>
      ) : null}
    </header>
  );
}
