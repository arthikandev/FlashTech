import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import {
  LANDING_NAV_ENTRIES,
  NAV_LINK_CLASS,
  navLinkEmphasisClass,
  type NavLinkItem,
} from "../nav";
import { LandingNavDropdown } from "./LandingNavDropdown";

type Props = {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
};

export function LandingNavLinks({
  onNavigate,
  className = "flex items-center gap-4 xl:gap-5 flex-nowrap",
  itemClassName = NAV_LINK_CLASS,
}: Props) {
  const { t } = useLandingLocale();

  return (
    <div className={className}>
      {LANDING_NAV_ENTRIES.map((entry) =>
        entry.type === "dropdown" ? (
          <LandingNavDropdown
            key={entry.key}
            item={entry}
            wrapper="div"
            onNavigate={onNavigate}
            linkClassName={cn(itemClassName, navLinkEmphasisClass(entry.emphasize))}
          />
        ) : (
          <NavEntryLink
            key={entry.key}
            item={entry}
            className={cn(itemClassName, navLinkEmphasisClass(entry.emphasize))}
            onNavigate={onNavigate}
            label={t(entry.key)}
          />
        )
      )}
    </div>
  );
}

function NavEntryLink({
  item,
  className,
  onNavigate,
  label,
}: {
  item: NavLinkItem;
  className: string;
  onNavigate?: () => void;
  label: string;
}) {
  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onNavigate}>
        {label}
      </Link>
    );
  }
  return (
    <a href={item.href} className={className} onClick={onNavigate}>
      {label}
    </a>
  );
}
