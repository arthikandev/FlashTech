import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Bell, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clerkEnabled } from "@/convex/api";
import { useDashboardContext } from "../context/DashboardContext";
import { getPageTitle } from "./navConfig";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onOpenNotifications: () => void;
  signedIn: boolean;
  sidebarTrigger?: ReactNode;
};

export function DashboardTopBar({
  search,
  onSearchChange,
  onOpenNotifications,
  signedIn,
  sidebarTrigger,
}: Props) {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);
  const [localSearch, setLocalSearch] = useState(search);
  const deferredSearch = useDeferredValue(localSearch);

  const {
    embedKey,
    embedOptions,
    onEmbedKeyChange,
    linking,
    linkError,
    linkToCurrentBusiness,
    needsMembership,
  } = useDashboardContext();

  useEffect(() => {
    const t = window.setTimeout(() => onSearchChange(deferredSearch), 300);
    return () => window.clearTimeout(t);
  }, [deferredSearch, onSearchChange]);

  const workspaceOptions = useMemo(() => embedOptions, [embedOptions]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-sidebar/95 px-4 backdrop-blur-sm lg:px-6">
      {sidebarTrigger}
      <div className="hidden min-w-0 sm:block">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <p className="text-sm font-medium">{pageTitle}</p>
      </div>

      <Select value={embedKey} onValueChange={(v) => v && onEmbedKeyChange(v)}>
        <SelectTrigger className="hidden h-8 w-[140px] text-xs md:flex">
          <SelectValue placeholder="Workspace" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {workspaceOptions.map((b) => (
              <SelectItem key={b.key} value={b.key}>
                {b.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="relative mx-auto flex max-w-md flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search sessions…"
          className="h-9 pl-9"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 text-[10px] text-chart-2 sm:flex">
          <span className="live-dot" />
          Live
        </span>

        {signedIn && needsMembership && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={linkToCurrentBusiness}
            disabled={linking}
            className="hidden text-xs sm:inline-flex"
          >
            {linking ? "Linking…" : "Link workspace"}
          </Button>
        )}

        <Button type="button" variant="ghost" size="icon" onClick={onOpenNotifications} aria-label="Notifications">
          <Bell />
        </Button>

        <Link
          to="/dashboard/settings"
          className="hidden rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground sm:inline"
        >
          Settings
        </Link>

        {clerkEnabled && !signedIn ? (
          <SignInButton mode="modal">
            <Button type="button" variant="outline" size="sm">
              Sign in
            </Button>
          </SignInButton>
        ) : clerkEnabled ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            PIQ
          </span>
        )}
      </div>

      {linkError ? (
        <p className="absolute top-full right-4 left-4 mt-1 text-xs text-destructive" role="alert">
          {linkError}
        </p>
      ) : null}
    </header>
  );
}
