import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";
import { useClerkUserButtonAppearance } from "@/auth/useClerkUserButtonAppearance";
import { clerkEnabled } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { t } from "../i18n/canvas.en";
import type { UsageBalance } from "../hooks/useUsageBalance";

type Props = {
  usage: UsageBalance | undefined;
};

function workspaceTitle(
  signedIn: boolean,
  businessName: string | undefined,
  workspaceLabel: string
): string {
  if (signedIn && businessName?.trim()) return businessName.trim();
  if (signedIn) return workspaceLabel;
  return "Demo workspace";
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/canvas/dashboard")) return "Dashboard";
  if (pathname.startsWith("/canvas/profile")) return t("profile.title");
  if (pathname.startsWith("/canvas/sessions")) return t("sidebar.sessions");
  if (pathname.startsWith("/canvas/analytics")) return t("sidebar.analytics");
  if (pathname.startsWith("/canvas/settings")) return t("sidebar.settings");
  if (pathname.startsWith("/canvas/workflow")) return t("workflow.title");
  if (pathname.startsWith("/canvas/webhooks")) return t("webhooks.title");
  if (pathname.startsWith("/canvas/embed")) return t("embed.title");
  if (pathname.startsWith("/canvas/help")) return t("help.title");
  if (pathname.startsWith("/canvas/categories")) return t("sidebar.categories");
  return t("sidebar.advisor");
}

export function CanvasHeader({ usage }: Props) {
  const userButtonAppearance = useClerkUserButtonAppearance();
  const { business, signedIn, embedKey, workspaceLabel } = useTenant();
  const location = useLocation();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const wsTitle = workspaceTitle(signedIn, business?.name, workspaceLabel);
  const onAdvisor =
    location.pathname === "/canvas" || location.pathname === "/canvas/";
  const onProfile = location.pathname.startsWith("/canvas/profile");
  const title = pageTitle(location.pathname);

  const creditsLabel =
    usage != null
      ? `${usage.remaining} / ${usage.limit} ${t("header.credits")}`
      : null;

  const warnCredits =
    usage != null && usage.limit > 0 && usage.remaining / usage.limit <= 0.2;

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {!onAdvisor ? (
          <Link
            to={`/canvas${qs}`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">{t("subpage.back")}</span>
          </Link>
        ) : null}
        {clerkEnabled && signedIn ? (
          <UserButton afterSignOutUrl="/" appearance={userButtonAppearance} />
        ) : (
          <Link
            to="/"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold hover:bg-muted/80"
            aria-label={t("header.brand")}
          >
            PIQ
          </Link>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          {!onAdvisor ? (
            <p className="truncate text-[11px] text-muted-foreground">{wsTitle}</p>
          ) : null}
          {!onAdvisor && !onProfile && signedIn ? (
            <Link
              to={`/canvas/profile${qs}`}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              {t("header.manageProfile")}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {creditsLabel ? (
          <span
            className={cn(
              "hidden rounded-full border px-3 py-1 text-[10px] font-medium sm:inline",
              warnCredits
                ? "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                : "border-border bg-muted text-muted-foreground"
            )}
            title="PresenceIQ intelligence API calls this billing period"
          >
            {creditsLabel}
          </span>
        ) : null}
        <AnimatedThemeToggler variant="circle" duration={450} />
        <Link
          to="/"
          className="hidden min-w-0 text-right sm:block"
          aria-label={t("header.brand")}
        >
          <p className="font-serif text-lg tracking-tight text-foreground">PresenceIQ</p>
        </Link>
      </div>
    </header>
  );
}
