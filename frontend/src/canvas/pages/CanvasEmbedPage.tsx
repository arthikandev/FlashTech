import { useState } from "react";
import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
import { showSuccess } from "@/lib/toast";
import { buildEmbedSnippet } from "../lib/embedSnippet";
import { CanvasSubpageHeader } from "../shell/CanvasSubpageHeader";
import { t } from "../i18n/canvas.en";

export function CanvasEmbedPage() {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;
  const snippet = buildEmbedSnippet(embedKey);
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    showSuccess(t("embed.copied"));
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] space-y-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("embed.title")} subtitle={t("embed.subtitle")} />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.25} />
            <p className="text-sm text-muted-foreground">{t("embed.intro")}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("embed.key")}
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">{embedKey}</p>
          </div>
          <Textarea readOnly value={snippet} className="min-h-[100px] font-mono text-xs" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void copySnippet()}>
              {copied ? t("embed.copied") : t("embed.copy")}
            </Button>
            <Link
              to={`/canvas${qs}`}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              {t("embed.testAdvisor")}
            </Link>
            <Link
              to={`/canvas/settings${qs}&tab=avatar`}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              {t("embed.avatarSettings")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
