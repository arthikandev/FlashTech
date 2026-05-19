import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet } from "@/components/ui/Sheet";
import { clerkEnabled } from "@/convex/api";
import { CANVAS_PATH } from "@/lib/postAuth";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import { useClerkUserButtonAppearance } from "@/auth/useClerkUserButtonAppearance";
import { NAV_LINK_CLASS } from "../nav";
import { LandingNavLinks } from "./LandingNavLinks";

type Props = {
  open: boolean;
  onClose: () => void;
};

const navLinkClass = `${NAV_LINK_CLASS} block py-3.5`;

function MobileMenuAuth({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useLandingLocale();
  const userButtonAppearance = useClerkUserButtonAppearance();

  if (!clerkEnabled) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/register" className={NAV_LINK_CLASS} onClick={onNavigate}>
          {t("auth.signIn")}
        </Link>
        <Link
          to="/register"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] transition-colors hover:border-primary/40"
        >
          {t("auth.getStarted")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SignedOut>
        <Link to="/login" className={NAV_LINK_CLASS} onClick={onNavigate}>
          {t("auth.signIn")}
        </Link>
        <Link
          to="/register"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-full border border-[#E1E0CC]/25 px-6 py-3 text-sm text-[#E1E0CC] transition-colors hover:border-primary/40"
        >
          {t("auth.getStarted")}
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          to={CANVAS_PATH}
          onClick={onNavigate}
          className="flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm text-[#E1E0CC] transition-colors hover:border-primary/60"
        >
          {t("auth.openWorkspace")}
        </Link>
        <UserButton afterSignOutUrl="/" appearance={userButtonAppearance} />
      </SignedIn>
    </div>
  );
}

export function LandingMobileMenu({ open, onClose }: Props) {
  const handleNavigate = () => onClose();

  const header = (
    <div className="flex shrink-0 items-center justify-between border-b border-[#212121] px-5 py-4">
      <Link
        to="/"
        onClick={handleNavigate}
        className="font-serif text-lg text-[#E1E0CC] tracking-tight"
      >
        PresenceIQ
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-[#E1E0CC]"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} header={header} ariaLabel="Navigation menu">
      <div className="flex min-h-full flex-col">
        <LanguageSwitcher className="mb-6" />
        <LandingNavLinks
          variant="mobile"
          onNavigate={handleNavigate}
          className="flex flex-col gap-0"
          itemClassName={navLinkClass}
        />
        <div className="mt-auto border-t border-[#212121] pt-4">
          <MobileMenuAuth onNavigate={handleNavigate} />
        </div>
      </div>
    </Sheet>
  );
}
