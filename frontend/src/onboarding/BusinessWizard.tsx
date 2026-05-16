import { useState } from "react";
import { Link } from "react-router-dom";

type OnboardResult = {
  businessId: string;
  embedKey: string;
  embedSnippet: string;
  embedUrl: string;
  dashboardHint?: string;
};

const backendUrl =
  (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/$/, "") ||
  "http://localhost:3001";

export function BusinessWizard() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("bank");
  const [personaTone, setPersonaTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${backendUrl}/api/businesses/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry, personaTone }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message ?? "Onboarding failed");
      }
      setResult(json.data as OnboardResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white">Onboard a business</h1>
        <p className="mt-2 text-sm text-slate-400">
          Creates a tenant in Convex and returns your embed snippet.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-400">Business name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              placeholder="Acme Bank"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Industry</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="bank">Bank</option>
              <option value="saas">SaaS</option>
              <option value="hotel">Hotel</option>
              <option value="hospital">Hospital</option>
              <option value="ecommerce">E-commerce</option>
              <option value="hr">HR</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Persona tone</span>
            <input
              value={personaTone}
              onChange={(e) => setPersonaTone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create business"}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-4 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6">
            <p className="text-sm text-emerald-300">
              Created <strong>{result.embedKey}</strong>
            </p>
            <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
              {result.embedSnippet}
            </pre>
            <p className="text-xs text-slate-500">{result.dashboardHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
