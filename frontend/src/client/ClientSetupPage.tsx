import { useMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/app-shell/AppShell";
import { api } from "@/convex/api";
import { INDUSTRY_CATEGORIES } from "@/lib/categories/industryCategories";
import { setLastEmbedKey } from "@/lib/postAuth";
import type { Industry } from "@/onboarding/types";
import { cn } from "@/lib/utils";

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
    setSubmitting(true);
    setError(null);
    try {
      const result = (await createAccount({
        businessName: businessName.trim(),
        industry,
        website: website.trim() || undefined,
      })) as { embedKey: string };
      setLastEmbedKey(result.embedKey);
      navigate("/onboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create client account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      backTo="/login"
      title="Create your client account"
      subtitle="Choose your industry category and business name. You will configure your avatar in onboarding next."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Industry category</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {INDUSTRY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const selected = industry === cat.industryKey;
              return (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setIndustry(cat.industryKey)}
                  className={cn(
                    "flex items-start gap-3 border p-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
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
            className="w-full border border-border bg-background px-4 py-3 text-sm"
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
            className="w-full border border-border bg-background px-4 py-3 text-sm"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || !businessName.trim() || !industry}
          className="h-12 w-full bg-primary text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {submitting ? "Creating account…" : "Continue to onboarding"}
        </button>
      </form>
    </AppShell>
  );
}
