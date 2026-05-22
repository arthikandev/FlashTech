import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Copy, KeyRound, Save } from "lucide-react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { buildEmbedSnippet } from "@/canvas/lib/embedSnippet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminEmbed() {
  const { businessId, business, embedKey } = useTenant();
  const rotate = useMutation(api.embed.rotateEmbedKey);
  const updateAvatar = useMutation(api.embed.updateAvatarConfig);

  const [personaTone, setPersonaTone] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [bpAgentId, setBpAgentId] = useState("");
  const [busy, setBusy] = useState<"copy" | "rotate" | "save" | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setPersonaTone(business?.avatarConfig?.personaTone ?? "");
    setDefaultLanguage(business?.avatarConfig?.defaultLanguage ?? "en");
    setBpAgentId(business?.avatarConfig?.bpAgentId ?? "");
  }, [business?.avatarConfig]);

  const snippet = buildEmbedSnippet(embedKey || "");

  async function handleCopy() {
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } finally {
      setBusy(null);
    }
  }

  async function handleRotate() {
    if (!businessId) return;
    if (
      !window.confirm(
        "Rotate the embed key? Previous embeds on your site will stop working until you paste the new snippet."
      )
    )
      return;
    setBusy("rotate");
    setErrorMsg(null);
    try {
      await rotate({ businessId: businessId as unknown as string });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    setBusy("save");
    setErrorMsg(null);
    try {
      await updateAvatar({
        businessId: businessId as unknown as string,
        personaTone,
        defaultLanguage,
        bpAgentId: bpAgentId.trim() ? bpAgentId.trim() : undefined,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMsg ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Embed snippet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Embed key
              </p>
              <p className="font-mono text-sm text-foreground">
                {embedKey || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRotate}
              disabled={busy === "rotate"}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              <KeyRound className="size-3" /> Rotate
            </button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-muted px-3 py-3 text-[11px] leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            disabled={busy === "copy"}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Copy className="size-3" />{" "}
            {copyState === "copied" ? "Copied" : "Copy snippet"}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Avatar persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSave}>
            <div className="sm:col-span-2">
              <label
                htmlFor="persona-tone"
                className="block text-xs font-medium text-muted-foreground"
              >
                Persona tone
              </label>
              <textarea
                id="persona-tone"
                value={personaTone}
                onChange={(e) => setPersonaTone(e.target.value)}
                rows={3}
                placeholder="e.g. trusted advisor — formal, bilingual SI/EN"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="default-lang"
                className="block text-xs font-medium text-muted-foreground"
              >
                Default language
              </label>
              <input
                id="default-lang"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                placeholder="en"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="bp-agent"
                className="block text-xs font-medium text-muted-foreground"
              >
                BeyondPresence agent ID
              </label>
              <input
                id="bp-agent"
                value={bpAgentId}
                onChange={(e) => setBpAgentId(e.target.value)}
                placeholder="bey-…"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy === "save"}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Save className="size-4" /> Save persona
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
