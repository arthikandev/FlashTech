import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { goToBackendDashboard } from "@/lib/backendUrl";
import { markOnboardingComplete } from "../storage";
import type { OnboardApiResult } from "../submitOnboarding";
import { OnboardingShell } from "../components/OnboardingShell";

type Props = {
  result: OnboardApiResult | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onBack: () => void;
  showBack: boolean;
};

export function InstallScriptStep({
  result,
  error,
  isLoading,
  onRetry,
  onBack,
  showBack,
}: Props) {
  const [copied, setCopied] = useState(false);

  const embedKey = result?.embedKey ?? "";
  const snippet = result?.embedSnippet ?? "";

  async function handleCopy() {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function handleFinish() {
    if (!result) return;
    markOnboardingComplete();
    void goToBackendDashboard();
  }

  if (isLoading) {
    return (
      <OnboardingShell
        title="Install script"
        description="Creating your workspace…"
        showBack={showBack}
        onBack={onBack}
      >
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </OnboardingShell>
    );
  }

  if (error || !result) {
    return (
      <OnboardingShell
        title="Install script"
        description="We could not create your workspace. Check that the backend is running, then try again."
        showBack={showBack}
        onBack={onBack}
        footerExtra={
          <button
            type="button"
            onClick={onRetry}
            className="h-12 px-6 text-sm font-medium bg-primary text-[var(--primary-foreground)] hover:opacity-90 transition-opacity sm:ml-auto"
          >
            Retry
          </button>
        }
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="Install script"
      description="Paste this snippet before the closing </body> tag on your site."
      onBack={onBack}
      onContinue={handleFinish}
      continueLabel="Finish setup"
      showBack={showBack}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Embed key
        </p>
        <code className="block px-4 py-2 bg-muted text-sm font-mono text-foreground border border-border">
          {embedKey}
        </code>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Embed code
          </p>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 bg-muted border border-border text-xs sm:text-sm font-mono text-foreground leading-relaxed">
          {snippet}
        </pre>
      </div>
    </OnboardingShell>
  );
}
