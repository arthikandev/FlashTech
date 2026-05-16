import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";

const bullets = [
  "Hyper-realistic video avatar powered by Beyond Presence",
  "Personalised opener from pre-conversation intent scoring",
  "Real-time CRM context and recommended next action",
  "One embed — no frontend API code required",
];

export function BeyondPresenceLiveSection() {
  return (
    <section
      id="beyond-presence"
      className="relative border-t border-[#212121] bg-black px-4 py-20 md:py-28"
    >
      <div className="bg-noise absolute inset-0 opacity-[0.12] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <p className="text-primary text-xs uppercase tracking-widest mb-3">
            Powered by Beyond Presence
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#E1E0CC] leading-tight">
            Meet your AI sales rep — live on every page
          </h2>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-lg">
            PresenceIQ scores visitor intent before the first word, syncs your Beyond Presence
            agent with a tailored system prompt, and embeds the avatar where your customers
            already are.
          </p>
          <ul className="mt-8 space-y-3">
            {bullets.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-400">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/demos/seylan"
              className="shimmer-btn inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
            >
              Try enterprise demo
            </Link>
            <Link
              to="/onboard"
              className="inline-flex items-center rounded-full border border-[#212121] px-5 py-2.5 text-sm text-[#E1E0CC] hover:border-primary/40 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/10 blur-xl pointer-events-none" />
          <div className="relative rounded-2xl border border-[#212121] bg-[#0a0a0a] p-3 sm:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                Live agent
              </span>
              <span className="text-[10px] uppercase tracking-widest text-primary">
                Beyond Presence
              </span>
            </div>
            <BeyondPresenceFrame height={560} className="rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
