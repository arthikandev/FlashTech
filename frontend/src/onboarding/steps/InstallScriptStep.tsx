import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { buildEmbedSnippet, slugifyEmbedKey } from "../constants";
import { markOnboardingComplete } from "../storage";
import { OnboardingShell } from "../components/OnboardingShell";
import type { OnboardingData } from "../types";

type Props = {
  data: OnboardingData;
  onBack: () => void;
  showBack: boolean;
};

export function InstallScriptStep({ data, onBack, showBack }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const embedKey = slugifyEmbedKey(data.companyName);
  const snippet = buildEmbedSnippet(embedKey);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function handleFinish() {
    markOnboardingComplete();
    navigate("/dashboard", { replace: true });
  }

  return (
    <OnboardingShell
      title="Install script"
      description="Paste this snippet before the closing </body> tag on your site."
      onBack={onBack}
      showBack={showBack}
      footerExtra={
        <ShimmerButton
          type="button"
          onClick={handleFinish}
          className="h-12 w-full sm:flex-1 text-sm font-semibold text-[var(--primary-foreground)]"
          background="var(--primary)"
          shimmerColor="var(--primary-foreground)"
          borderRadius="0"
          shimmerDuration="2.5s"
        >
          Finish setup
        </ShimmerButton>
      }
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
            onClick={handleCopy}
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
