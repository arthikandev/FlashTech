import { useMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignupFunnelLayout } from "@/auth/SignupFunnelLayout";
import { api } from "@/convex/api";
import { INDUSTRY_CATEGORIES } from "@/lib/categories/industryCategories";
import { setLastEmbedKey } from "@/lib/postAuth";
import { cn } from "@/lib/utils";
import { onboardingInputClass } from "@/onboarding/inputStyles";
import { loadDraft, saveDraft } from "@/onboarding/storage";
import type { Industry } from "@/onboarding/types";

export function ClientSetupPage() {
  const navigate = useNavigate();
  const createAccount = useMutation(api.clients.createAccount);
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !industry) {
      setError("Business name and category are required.");
      return;
    }
    const trimmedWebsite = website.trim();
    if (trimmedWebsite) {
      try {
        const parsed = new URL(trimmedWebsite);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("protocol");
        }
      } catch {
        setError("Website must be a full URL starting with http:// or https://");
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = (await createAccount({
        businessName: businessName.trim(),
        industry,
        website: trimmedWebsite || undefined,
      })) as { embedKey: string };
      setLastEmbedKey(result.embedKey);
      saveDraft({
        ...loadDraft(),
        companyName: businessName.trim(),
        industry,
        website: trimmedWebsite,
      });
      navigate("/onboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create client account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SignupFunnelLayout
      macroStep={2}
      title="Create your workspace"
      subtitle="Choose your industry and business name. Next you will configure your avatar and embed."
      backTo="/register"
      backLabel="Back"
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 sm:space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Industry category</p>
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {INDUSTRY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const selected = industry === cat.industryKey;
              return (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setIndustry(cat.industryKey)}
                  aria-pressed={selected}
                  aria-label={`${cat.name} — ${cat.tag}`}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.tag}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-medium">
            Business name
          </label>
          <input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Commercial Bank of Ceylon"
            className={onboardingInputClass}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium">
            Website (optional)
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className={onboardingInputClass}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || !businessName.trim() || !industry}
          className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {submitting ? "Creating workspace…" : "Continue to onboarding"}
        </button>
      </form>
    </SignupFunnelLayout>
  );
}
