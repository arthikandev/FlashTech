import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { FOOTER_COMPANY, FOOTER_PRODUCT } from "../footerLinks";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const SOCIAL_LINKS: Array<{
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "X (Twitter)", href: "https://twitter.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com", icon: GitHubIcon },
];

const linkClass =
  "text-[0.9375rem] sm:text-base leading-relaxed text-gray-500 transition-colors hover:text-[#E1E0CC]";

const wordmarkClass =
  "landing-footer-wordmark pointer-events-none whitespace-nowrap font-serif font-bold leading-[0.8] tracking-[-0.04em] select-none text-[clamp(5.5rem,26vw,15rem)]";

export function LandingFooter() {
  const { t } = useLandingLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[#212121] bg-black">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#101010] hover:text-[#E1E0CC]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-600">
              © {year} PresenceIQ
            </p>
          </div>

          <div className="flex gap-12 md:gap-20">
            <div>
              <p className="text-base font-semibold text-[#E1E0CC]">{t("footer.columns.company")}</p>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_COMPANY.map((item) => (
                  <li key={item.key}>
                    {"disabled" in item && item.disabled ? (
                      <span className="cursor-not-allowed text-[0.9375rem] sm:text-base text-gray-600">
                        {t(item.key)}
                      </span>
                    ) : (
                      <a href={item.href} className={linkClass}>
                        {t(item.key)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-base font-semibold text-[#E1E0CC]">{t("footer.columns.product")}</p>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_PRODUCT.map((item) =>
                  "to" in item ? (
                    <li key={item.key}>
                      <Link to={item.to} className={linkClass}>
                        {t(item.key)}
                      </Link>
                    </li>
                  ) : "external" in item && item.external ? (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClass}
                      >
                        {t(item.key)}
                      </a>
                    </li>
                  ) : (
                    <li key={item.key}>
                      <a href={item.href} className={linkClass}>
                        {t(item.key)}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative h-[clamp(10rem,32vw,20rem)] overflow-hidden md:h-[clamp(12rem,34vw,22rem)]"
        aria-hidden
      >
        <div className="landing-footer-wordmark-wrap pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[22%]">
          <span className={`${wordmarkClass} landing-footer-wordmark--echo`} aria-hidden>
            PresenceIQ
          </span>
          <span className={wordmarkClass}>PresenceIQ</span>
        </div>
      </div>
    </footer>
  );
}
