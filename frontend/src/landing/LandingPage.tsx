import { Link } from "react-router-dom";
import { AboutSection } from "./sections/AboutSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";

export function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <footer className="border-t border-[#212121] px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <span>© PresenceIQ · Cursor Colombo Buildathon 2026</span>
          <div className="flex gap-6">
            <Link to="/dashboard" className="hover:text-[#E1E0CC] transition-colors">
              Dashboard
            </Link>
            <Link to="/demos/seylan" className="hover:text-[#E1E0CC] transition-colors">
              Demos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
