import { LandingFooter } from "./components/LandingFooter";
import { LandingLocaleProvider } from "./i18n/LandingLocaleProvider";
import { AboutSection } from "./sections/AboutSection";
import { BeyondPresenceLiveSection } from "./sections/BeyondPresenceLiveSection";
import { DashboardPreviewSection } from "./sections/DashboardPreviewSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";
import { IndustriesSection } from "./sections/IndustriesSection";
import { InsightSection } from "./sections/InsightSection";
import { MetricsBar } from "./sections/MetricsBar";
import { PipelineSection } from "./sections/PipelineSection";
import { PricingSection } from "./sections/PricingSection";
import { TechStackSection } from "./sections/TechStackSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export function LandingPage() {
  return (
    <LandingLocaleProvider>
      <div className="landing-theme brand-theme min-h-screen bg-black [&_section[id]]:scroll-mt-[5.75rem]">
        <HeroSection />
        <BeyondPresenceLiveSection />
        <MetricsBar />
        <AboutSection />
        <InsightSection />
        <PipelineSection />
        <FeaturesSection />
        <DashboardPreviewSection />
        <IndustriesSection />
        <TestimonialsSection />
        <PricingSection />
        <TechStackSection />
        <LandingFooter />
      </div>
    </LandingLocaleProvider>
  );
}
