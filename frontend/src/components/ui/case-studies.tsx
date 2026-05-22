import { useEffect, useState, lazy, Suspense } from "react";
import { Monitor, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

const CountUp = lazy(() => import("react-countup"));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function parseMetricValue(raw: string) {
  const value = (raw ?? "").toString().trim();
  const m = value.match(
    /^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/
  );
  if (!m) {
    return { prefix: "", end: 0, suffix: value, decimals: 0 };
  }
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/,/g, "");
  const end = parseFloat(normalized);
  const decimals = normalized.split(".")[1]?.length ?? 0;
  return {
    prefix: prefix ?? "",
    end: isNaN(end) ? 0 : end,
    suffix: suffix ?? "",
    decimals,
  };
}

function MetricStat({
  value,
  label,
  sub,
  duration = 1.6,
}: {
  value: string;
  label: string;
  sub?: string;
  duration?: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals } = parseMetricValue(value);

  return (
    <div className="flex flex-col gap-2 text-left p-6">
      <p
        className="text-2xl font-medium text-foreground sm:text-4xl"
        aria-label={`${label} ${value}`}
      >
        {prefix}
        {reduceMotion ? (
          <span>
            {end.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </span>
        ) : (
          <Suspense fallback={<span>{value}</span>}>
            <CountUp
              end={end}
              decimals={decimals}
              duration={duration}
              separator=","
              enableScrollSpy
              scrollSpyOnce
            />
          </Suspense>
        )}
        {suffix}
      </p>
      <p className="font-medium text-foreground text-left">{label}</p>
      {sub ? <p className="text-muted-foreground text-left">{sub}</p> : null}
    </div>
  );
}

export interface CaseStudy {
  id: number;
  title: string;
  quote: string;
  name: string;
  role: string;
  image: string;
  icon: LucideIcon;
  metrics: { value: string; label: string; sub?: string }[];
}

export interface CaseStudiesProps {
  heading?: string;
  description?: string;
  studies?: CaseStudy[];
}

const defaultStudies: CaseStudy[] = [
  {
    id: 1,
    title: "Banking embed at scale",
    quote:
      "PresenceIQ surfaced Sarangan's return visits and plan comparisons before our avatar spoke — the opener felt genuinely personal.",
    name: "Priya Mendis",
    role: "Head of Digital, Northwind Bank",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=750&fit=crop",
    icon: Monitor,
    metrics: [
      { value: "40%", label: "Faster handoffs", sub: "From embed to live call" },
      { value: "95%", label: "Context accuracy", sub: "Pre-conversation briefs" },
    ],
  },
  {
    id: 2,
    title: "SaaS dashboard clarity",
    quote:
      "Our ops team reduced context switching — visitor intent and session history showed up in Convex before the demo started.",
    name: "James Okonkwo",
    role: "Solutions Architect, CloudMetrics",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=750&fit=crop",
    icon: LayoutDashboard,
    metrics: [
      { value: "3.5x", label: "Demo efficiency", sub: "Across vertical pilots" },
      { value: "70%", label: "Fewer repeat questions", sub: "In sales calls" },
    ],
  },
  {
    id: 3,
    title: "Hospitality personalization",
    quote:
      "Coral Resort's embed recognized returning guests and package interest — onboarding new concierge staff became seamless.",
    name: "Elena Vasquez",
    role: "Guest Experience Lead",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=750&fit=crop",
    icon: Users,
    metrics: [
      { value: "2x", label: "Faster onboarding", sub: "For new team members" },
      { value: "88%", label: "Guest recognition", sub: "On return visits" },
    ],
  },
];

export function CaseStudies({
  heading = "Real results with PresenceIQ",
  description = "From banking embeds to hospitality — teams ship faster with pre-conversation intelligence.",
  studies = defaultStudies,
}: CaseStudiesProps) {
  return (
    <section
      id="case-studies"
      className="py-24 md:py-32 bg-background"
      aria-labelledby="case-studies-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <h2
            id="case-studies-heading"
            className="text-3xl font-semibold md:text-5xl text-foreground"
          >
            {heading}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="mt-16 md:mt-20 flex flex-col gap-16 md:gap-20">
          {studies.map((study, idx) => {
            const reversed = idx % 2 === 1;
            const Icon = study.icon;
            return (
              <div
                key={study.id}
                className="grid gap-10 lg:grid-cols-3 xl:gap-16 items-center border-b border-border pb-12 last:border-0"
              >
                <div
                  className={[
                    "flex flex-col sm:flex-row gap-8 lg:col-span-2 lg:border-r lg:pr-10 xl:pr-14 text-left",
                    reversed
                      ? "lg:order-2 lg:border-r-0 lg:border-l lg:pl-10 xl:pl-14 lg:pr-0"
                      : "",
                  ].join(" ")}
                >
                  <div className="relative shrink-0">
                    <img
                      src={study.image}
                      alt=""
                      width={240}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] h-auto w-full max-w-[240px] rounded-2xl object-cover ring-1 ring-border hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-xl border border-border bg-card p-2.5 shadow-lg">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                  </div>
                  <figure className="flex flex-col justify-between gap-6 text-left min-w-0">
                    <blockquote>
                      <h3 className="text-lg sm:text-xl font-medium text-foreground leading-relaxed">
                        {study.title}
                        <span className="block text-muted-foreground text-sm sm:text-base font-normal mt-3">
                          {study.quote}
                        </span>
                      </h3>
                    </blockquote>
                    <figcaption>
                      <span className="font-medium text-foreground">{study.name}</span>
                      <span className="block text-sm text-muted-foreground">{study.role}</span>
                    </figcaption>
                  </figure>
                </div>

                <div
                  className={[
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 self-center",
                    reversed ? "lg:order-1" : "",
                  ].join(" ")}
                >
                  {study.metrics.map((metric, i) => (
                    <MetricStat
                      key={`${study.id}-${i}`}
                      value={metric.value}
                      label={metric.label}
                      sub={metric.sub}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
