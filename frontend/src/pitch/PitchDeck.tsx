import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";

const SLIDES = [
  {
    title: "The problem",
    body: "Enterprises have all the customer data — CRM records, session history, purchase patterns — yet still greet every visitor the same way. Chatbots are generic. Humans are unavailable at 2am. The data exists. Nobody uses it to personalise the first word.",
  },
  {
    title: "Live demo",
    body: "Reload Seylan Bank pricing. In under 2 seconds the avatar says: Welcome back Sarangan — I see you have been comparing our Gold and Platinum plans. Your automation endpoints can raise a Slack hot-lead alert. The dashboard updates with transcript and intent arc.",
    cta: { label: "Open Seylan demo", to: "/sites/seylan/index.html" },
  },
  {
    title: "How it works",
    body: "7-step pipeline: Visitor fingerprint → CRM fetch via HTTPS webhooks → OpenAI intent score → ElevenLabs voice → Beyond Presence dynamic context → personalised opener. Each sponsor tool plays a distinct, essential role.",
    cta: { label: "See pipeline", to: "/#pipeline" },
  },
  {
    title: "Market & audiences",
    body: "6 industries: Banks, SaaS, Hotels, Hospitals, E-commerce, HR. TAM: $15B+ conversational AI growing 22% YoY. One platform — infinite deployments.",
    cta: { label: "Industries", to: "/#industries" },
  },
  {
    title: "Business model",
    body: "SaaS: per intelligence-call + per avatar minute. Free tier (100 calls/month) → Pro ($99/mo) → Enterprise. Post-hackathon: API marketplace, white-label, industry templates.",
  },
] as const;

export function PitchDeck() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <PageShell
      title="Pitch deck"
      subtitle="5 slides — rehearse the winning demo script"
      backLabel="← Home"
      maxWidth="lg"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <span className="text-xs text-primary uppercase tracking-widest">
          Slide {index + 1} / {SLIDES.length}
        </span>
        <Link to="/present" className="text-xs text-gray-500 hover:text-primary">
          Presenter split-screen →
        </Link>
      </div>

      <section className="rounded-2xl border border-[#212121] bg-[#101010] p-8 md:p-12 min-h-[320px] flex flex-col">
        <h2 className="font-serif text-2xl md:text-3xl text-[#E1E0CC]">{slide.title}</h2>
        <p className="mt-4 text-gray-400 leading-relaxed flex-1">{slide.body}</p>
        {"cta" in slide && slide.cta && (
          <Link
            to={slide.cta.to}
            className="mt-6 inline-flex text-sm text-primary hover:underline"
          >
            {slide.cta.label} →
          </Link>
        )}
      </section>

      <div className="flex items-center justify-between mt-6 gap-4">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-lg border border-[#212121] px-4 py-2 text-sm text-gray-400 disabled:opacity-30 hover:text-[#E1E0CC]"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-[#212121]"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={index === SLIDES.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </PageShell>
  );
}
