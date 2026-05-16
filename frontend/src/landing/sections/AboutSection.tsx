import { AnimatedLetter } from "../components/AnimatedLetter";
import { WordsPullUpMultiStyle } from "../components/WordsPullUpMultiStyle";

const bodyText =
  "When a visitor lands on your site, PresenceIQ fingerprints the session, fetches CRM context, scores intent, and delivers a personalised opener to your avatar — all before the first word is spoken. Embed once, listen for presenceiq:ready, and watch return visitors surface in your live dashboard.";

export function AboutSection() {
  return (
    <section id="about" className="bg-background px-3 sm:px-4 py-16 sm:py-20 md:py-28 lg:py-32 transition-colors">
      <div className="max-w-6xl mx-auto bg-card border border-border rounded-xl sm:rounded-2xl md:rounded-3xl px-4 sm:px-6 py-10 sm:py-14 md:px-16 md:py-20 text-center">
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-widest mb-8">
          Pre-conversation intelligence
        </p>
        <WordsPullUpMultiStyle
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] mb-10 text-foreground"
          segments={[
            { text: "We read the visitor", className: "font-normal" },
            {
              text: "before the avatar speaks.",
              className: "font-serif italic",
            },
            {
              text: "Intent, CRM context, and opener — in under two seconds.",
              className: "font-normal",
            },
          ]}
        />
        <AnimatedLetter
          text={bodyText}
          className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed"
        />
      </div>
    </section>
  );
}
