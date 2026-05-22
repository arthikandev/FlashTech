import { Link } from "react-router-dom";
import { LandingFooter } from "./components/LandingFooter";
import { LandingLocaleProvider, useLandingLocale } from "./i18n/LandingLocaleProvider";

const API_DOCS_URL = "https://docs.presenceiq.ai";

const SOCIAL_LINKS = [
  { key: "developers.linkedin" as const, href: "https://linkedin.com" },
  { key: "developers.github" as const, href: "https://github.com" },
] as const;

const TEAM_MEMBERS = [
  { name: "Sarangna Raviraj", photo: "/developers/sarangna-raviraj.png" },
  { name: "Arthikan Vettivel", photo: "/developers/arthikan-vettivel.png" },
  { name: "Sriranganathan Thebikan", photo: "/developers/sriranganathan-thebikan.png" },
] as const;

function DevelopersContent() {
  const { t } = useLandingLocale();

  return (
    <div className="landing-theme brand-theme flex min-h-screen flex-col bg-black text-[#E1E0CC]">
      <header className="border-b border-[#212121] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="font-serif text-lg font-semibold tracking-tight text-primary transition-opacity hover:opacity-90"
          >
            PresenceIQ
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 transition-colors hover:text-[#E1E0CC]"
          >
            {t("developers.backHome")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[#212121]">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#1a1510]"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(225, 224, 204, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(225, 224, 204, 0.05) 0%, transparent 45%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
              {t("developers.eyebrow")}
            </p>
            <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold tracking-tight text-[#fdfcf8] md:text-5xl lg:text-6xl">
              {t("developers.title")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">
              {t("developers.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {SOCIAL_LINKS.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/14 bg-black/45 px-8 py-3 text-sm font-medium text-[#E1E0CC] backdrop-blur-xl transition-colors hover:border-white/25 hover:bg-white/5 hover:text-[#fdfcf8]"
                >
                  {t(key)}
                </a>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500">
              <a
                href={API_DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 underline-offset-4 transition-colors hover:text-[#E1E0CC] hover:underline"
              >
                {t("developers.apiDocs")}
              </a>
            </p>
          </div>
        </section>

        <section className="border-b border-[#212121] bg-black">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
              {t("developers.teamEyebrow")}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#fdfcf8] md:text-3xl">
              {t("developers.teamTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500 md:text-base">
              {t("developers.teamSubtitle")}
            </p>

            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM_MEMBERS.map((member) => (
                <li key={member.name} className="group">
                  <div className="overflow-hidden rounded-2xl border border-[#212121] bg-[#101010]">
                    <div className="aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-full w-full object-cover object-center grayscale transition duration-500 group-hover:grayscale-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-center font-serif text-lg font-semibold tracking-tight text-[#E1E0CC]">
                    {member.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export function DevelopersPage() {
  return (
    <LandingLocaleProvider>
      <DevelopersContent />
    </LandingLocaleProvider>
  );
}
