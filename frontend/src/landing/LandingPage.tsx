import { Link } from "react-router-dom";
import { AboutSection } from "./sections/AboutSection";
import { InsightSection } from "./sections/InsightSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { BeyondPresenceLiveSection } from "./sections/BeyondPresenceLiveSection";
import { HeroSection } from "./sections/HeroSection";
import { IndustriesSection } from "./sections/IndustriesSection";
import { MetricsBar } from "./sections/MetricsBar";
import { DashboardPreviewSection } from "./sections/DashboardPreviewSection";
import { PipelineSection } from "./sections/PipelineSection";
import { PricingSection } from "./sections/PricingSection";
import { TechStackSection } from "./sections/TechStackSection";

const FOOTER_PRODUCT = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Demos", to: "/demos/seylan" },
  { label: "Onboard", to: "/onboard" },
] as const;

const FOOTER_DEVELOPERS = [
  { label: "API docs", href: "https://docs.presenceiq.ai", external: true },
  { label: "Embed SDK", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;

const FOOTER_COMPANY = [
  { label: "About", href: "#about" },
  { label: "Privacy", href: "#", disabled: true },
] as const;

export function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection />
      <BeyondPresenceLiveSection />
      <MetricsBar />
      <AboutSection />
      <InsightSection />
      <PipelineSection />
      <DashboardPreviewSection />
      <IndustriesSection />
      <PricingSection />
      <TechStackSection />
      <FeaturesSection />

      <footer className="border-t border-[#212121] px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="font-serif text-xl text-primary">
                PresenceIQ
              </Link>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
                Pre-conversation intelligence for enterprise AI avatars.
              </p>
              <div className="mt-4 flex gap-4 text-xs text-gray-600">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                  X
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                  LinkedIn
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                  GitHub
                </a>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-4">Product</p>
              <ul className="space-y-2">
                {FOOTER_PRODUCT.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-gray-500 hover:text-[#E1E0CC] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-4">
                Developers
              </p>
              <ul className="space-y-2">
                {FOOTER_DEVELOPERS.map((item) =>
                  "external" in item && item.external ? (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-500 hover:text-[#E1E0CC] transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-500 hover:text-[#E1E0CC] transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-4">Company</p>
              <ul className="space-y-2">
                {FOOTER_COMPANY.map((item) => (
                  <li key={item.label}>
                    {"disabled" in item && item.disabled ? (
                      <span className="text-sm text-gray-600 cursor-not-allowed">{item.label}</span>
                    ) : (
                      <a
                        href={item.href}
                        className="text-sm text-gray-500 hover:text-[#E1E0CC] transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#212121] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} PresenceIQ. All rights reserved.</span>
            <span>Made with Convex & Beyond Presence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
