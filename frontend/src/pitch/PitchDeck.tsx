import { Link } from "react-router-dom";

const SLIDES = [
  {
    title: "The problem",
    body: "Visitors leave without personalised engagement. CRM data sits idle while generic chatbots miss context.",
  },
  {
    title: "Live demo",
    body: "Reload Seylan /pricing → Sarangan gets a personalised opener in under 2 seconds. Avatar + pipeline + CRM in one flow.",
  },
  {
    title: "Architecture",
    body: "Embed fingerprint → n8n CRM fetch → intent score → Convex → Beyond Presence avatar → Slack hot-lead → dashboard.",
  },
  {
    title: "Market",
    body: "Banks, SaaS, hotels — any site with returning visitors and CRM. One embed script, multi-tenant dashboard.",
  },
  {
    title: "Pricing",
    body: "Per-business embed key, usage-based pipeline calls, enterprise n8n + BYO-LLM. Hackathon: 3 demo tenants included.",
  },
];

export function PitchDeck() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white">Pitch deck</h1>
        <p className="text-sm text-slate-500">5 slides — Hour 24 rehearsal</p>

        <div className="mt-8 space-y-6">
          {SLIDES.map((s, i) => (
            <section
              key={s.title}
              className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-emerald-500">
                Slide {i + 1}
              </span>
              <h2 className="mt-2 font-display text-2xl text-white">{s.title}</h2>
              <p className="mt-3 text-slate-300">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
