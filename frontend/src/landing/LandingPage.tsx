import { CinematicFooter } from "@/components/ui/motion-footer";
import { AboutSection } from "./sections/AboutSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";
import { CaseStudiesSection } from "./sections/CaseStudiesSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export function LandingPage() {
  return (
    <div className="relative w-full bg-background min-h-screen overflow-x-hidden transition-colors">
      <main className="relative z-10 w-full bg-background shadow-[0_24px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.8)] rounded-b-2xl sm:rounded-b-3xl transition-colors">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <PricingSection />
        <CaseStudiesSection />
        <TestimonialsSection />
      </main>
      <CinematicFooter />
    </div>
  );
}
