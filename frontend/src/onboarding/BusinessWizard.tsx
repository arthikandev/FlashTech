import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { api, clerkEnabled } from "@/convex/api";
import { fireConfettiFireworks } from "@/lib/confettiFireworks";
import { setLastEmbedKey } from "@/lib/postAuth";
import { showError, showSuccess, showPromise } from "@/lib/toast";
import { markOnboardingComplete } from "./storage";

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

function fixSnippet(_snippet: string, embedKey: string): string {
  return `<script src="${backendUrl}/api/embed/${embedKey}" async></script>`;
}

const DEMO_EMBED_KEYS = new Set(["seylan-demo", "cloudmetrics-demo", "coral-demo"]);

export function BusinessWizard() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const onboardBusiness = useMutation(api.businesses.onboardBusiness);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("bank");
  const [personaTone, setPersonaTone] = useState("professional");
  const [bpAgentId, setBpAgentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [redirectIn, setRedirectIn] = useState(5);

  useEffect(() => {
    if (step !== 4 || !result) return;
    const t = setInterval(() => {
      setRedirectIn((n) => {
        if (n <= 1) {
          clearInterval(t);
          markOnboardingComplete();
          setLastEmbedKey(result.embedKey);
          navigate(`/dashboard?embedKey=${encodeURIComponent(result.embedKey)}`);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, result, navigate]);

  async function submitTenant() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (clerkEnabled && isSignedIn) {
        const data = await showPromise(
          onboardBusiness({
            name,
            industry: industry as "bank" | "saas" | "hotel" | "hospital" | "ecommerce" | "hr",
            personaTone,
            bpAgentId: bpAgentId.trim() || undefined,
          }),
          {
            loading: "Creating your workspace…",
            success: "Business created successfully",
            error: "Onboarding failed",
          }
        );
        const row = data as { businessId: string; embedKey: string };
        setResult({
          businessId: row.businessId,
          embedKey: row.embedKey,
          embedSnippet: fixSnippet("", row.embedKey),
          embedUrl: `${backendUrl}/api/embed/${row.embedKey}`,
        });
        setStep(4);
        fireConfettiFireworks();
        if (bpAgentId.trim()) {
          showSuccess("Beyond Presence agent linked to your tenant");
        }
        return;
      }

      const json = await showPromise(
        fetch(`${backendUrl}/api/businesses/onboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            industry,
            personaTone,
            bpAgentId: bpAgentId.trim() || undefined,
          }),
        }).then(async (res) => {
          const body = await res.json();
          if (!body.success) {
            throw new Error(body.message ?? "Onboarding failed");
          }
          return body;
        }),
        {
          loading: "Creating your workspace…",
          success: "Business created successfully",
          error: "Onboarding failed",
        }
      );
      const data = json.data as OnboardResult | undefined;
      if (!data?.embedKey) {
        throw new Error("Invalid onboarding response from server");
      }
      setResult({
        ...data,
        embedSnippet: fixSnippet(data.embedSnippet ?? "", data.embedKey),
        embedUrl: data.embedUrl ?? `${backendUrl}/api/embed/${data.embedKey}`,
      });
      setStep(4);
      fireConfettiFireworks();
      if (bpAgentId.trim()) {
        showSuccess("Beyond Presence agent linked to your tenant");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitTenant();
  }

  async function copySnippet() {
    if (!result?.embedSnippet) return;
    await navigator.clipboard.writeText(result.embedSnippet);
    setCopied(true);
    showSuccess("Embed snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  const demoPath = result
    ? DEMO_EMBED_KEYS.has(result.embedKey)
      ? `/demos/${result.embedKey.replace(/-demo$/, "")}`
      : "/demos/seylan"
    : "/demos/seylan";

  return (
    <PageShell
      title="Onboard your business"
      subtitle="Create a tenant, connect your avatar, and embed PresenceIQ on your site"
      backLabel="← Home"
      maxWidth="md"
    >
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-[#212121]"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 rounded-xl border border-[#212121] bg-[#101010] p-6">
          <p className="text-primary text-xs uppercase tracking-widest">
            Welcome to PresenceIQ
          </p>
          <h2 className="text-xl font-serif text-[#E1E0CC]">
            Pre-conversation intelligence for your website
          </h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>· Fingerprint visitors and score intent before the avatar speaks</li>
            <li>· Sync CRM context via n8n and personalise Beyond Presence agents</li>
            <li>· Monitor live sessions on your real-time dashboard</li>
          </ul>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-black"
          >
            Get started →
          </button>
        </div>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
          className="space-y-4"
        >
          <label className="block text-sm">
            <span className="text-gray-500">Business name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#212121] bg-[#101010] px-3 py-2 text-[#E1E0CC]"
              placeholder="Acme Bank"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-500">Industry</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#212121] bg-[#101010] px-3 py-2 text-[#E1E0CC]"
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
            <span className="text-gray-500">Persona tone</span>
            <input
              value={personaTone}
              onChange={(e) => setPersonaTone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#212121] bg-[#101010] px-3 py-2 text-[#E1E0CC]"
              placeholder="professional"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-[#212121] px-4 py-2 text-sm text-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-black"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">
            Optional: paste your Beyond Presence agent ID from{" "}
            <a
              href="https://app.bey.chat"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              app.bey.chat
            </a>
            . API keys stay on the backend only.
          </p>
          <label className="block text-sm">
            <span className="text-gray-500">BP Agent ID</span>
            <input
              value={bpAgentId}
              onChange={(e) => setBpAgentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#212121] bg-[#101010] px-3 py-2 text-[#E1E0CC] font-mono text-xs"
              placeholder="agent_..."
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-[#212121] px-4 py-2 text-sm text-gray-400"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => void submitTenant()}
              disabled={loading}
              className="rounded-lg border border-[#212121] px-4 py-2 text-sm text-gray-400 disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create tenant"}
            </button>
          </div>
        </form>
      )}

      {step === 4 && result && (
        <div className="space-y-4 rounded-xl border border-[#212121] bg-[#101010] p-5">
          <p className="text-sm text-emerald-400/90">Business created</p>
          <p className="text-xs text-gray-500">
            Embed key: <code className="text-primary">{result.embedKey}</code>
          </p>
          {bpAgentId.trim() ? (
            <p className="text-xs text-emerald-400/80">
              Beyond Presence agent linked to this tenant.
            </p>
          ) : null}
          <pre className="text-xs bg-black border border-[#212121] rounded-lg p-3 overflow-x-auto text-gray-400">
            {result.embedSnippet}
          </pre>
          <button
            type="button"
            onClick={() => void copySnippet()}
            className="text-xs text-primary hover:underline"
          >
            {copied ? "Copied!" : "Copy embed snippet"}
          </button>
          <p className="text-xs text-gray-500">
            Redirecting to dashboard in {redirectIn}s…
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={`/dashboard?embedKey=${encodeURIComponent(result.embedKey)}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black"
            >
              Open dashboard now
            </Link>
            <Link to={demoPath} className="text-sm text-gray-500 hover:text-primary">
              Try a demo →
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
