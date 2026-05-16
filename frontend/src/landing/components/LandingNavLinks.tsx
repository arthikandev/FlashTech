import { Link } from "react-router-dom";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import { LANDING_NAV_ITEMS, NAV_LINK_CLASS } from "../nav";

type Props = {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
};

export function LandingNavLinks({
  onNavigate,
  className = "flex items-center gap-6 xl:gap-8",
  itemClassName = NAV_LINK_CLASS,
}: Props) {
  const { t } = useLandingLocale();

  return (
    <div className={className}>
      {LANDING_NAV_ITEMS.map((item) =>
        item.to ? (
          <Link
            key={item.key}
            to={item.to}
            className={itemClassName}
            onClick={onNavigate}
          >
            {t(item.key)}
          </Link>
        ) : (
          <a
            key={item.key}
            href={item.href}
            className={itemClassName}
            onClick={onNavigate}
          >
            {t(item.key)}
          </a>
        ),
      )}
    </div>
  );
}
