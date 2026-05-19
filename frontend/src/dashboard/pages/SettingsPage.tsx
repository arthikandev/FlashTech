import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDashboardContext } from "../context/DashboardContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { showError, showSuccess } from "@/lib/toast";
import { buildEmbedSnippet } from "@/canvas/lib/embedSnippet";
import { INDUSTRIES } from "@/onboarding/constants";
import type { Industry } from "@/onboarding/types";
import { normalizeBpAgentId } from "@/lib/bpAgentId";
import { getBackendBaseUrl } from "@/lib/backendUrl";

type BpStatus = {
  configured: boolean;
  verified: boolean;
  agents?: Array<{ id: string; name: string }>;
  message?: string;
};

async function fetchBpStatus(): Promise<BpStatus> {
  const base = getBackendBaseUrl().replace(/\/$/, "");
  const res = await fetch(`${base}/api/beyondpresence/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as BpStatus;
}

type SettingsPageProps = {
  hidePageHeader?: boolean;
};

export function SettingsPage({ hidePageHeader = false }: SettingsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = useMemo(() => {
    if (tabParam === "avatar" || tabParam === "webhooks" || tabParam === "embed" || tabParam === "business") {
      return tabParam;
    }
    return "business";
  }, [tabParam]);

  const { business, businessId, embedKey } = useDashboardContext();
  const updateBusiness = useMutation(api.businesses.updateBusiness);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<string>("bank");
  const [personaTone, setPersonaTone] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [bpAgentId, setBpAgentId] = useState("");
  const [useNativeBpAgent, setUseNativeBpAgent] = useState(false);
  const [crmFetch, setCrmFetch] = useState("");
  const [crmPush, setCrmPush] = useState("");
  const [slack, setSlack] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [bpStatus, setBpStatus] = useState<BpStatus | null>(null);
  const [bpStatusLoading, setBpStatusLoading] = useState(false);
  const [bpStatusError, setBpStatusError] = useState<string | null>(null);
  const [manualBpInput, setManualBpInput] = useState(false);

  async function refreshBpStatus() {
    setBpStatusLoading(true);
    setBpStatusError(null);
    try {
      const status = await fetchBpStatus();
      setBpStatus(status);
    } catch (e) {
      setBpStatusError(e instanceof Error ? e.message : "Failed to fetch agents");
    } finally {
      setBpStatusLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab !== "avatar") return;
    if (bpStatus !== null) return;
    void refreshBpStatus();
  }, [activeTab, bpStatus]);

  useEffect(() => {
    if (!business) return;
    setName(business.name);
    setIndustry(business.industry ?? "bank");
    setPersonaTone(business.avatarConfig?.personaTone ?? "");
    setDefaultLanguage(business.avatarConfig?.defaultLanguage ?? "en");
    setBpAgentId(business.avatarConfig?.bpAgentId ?? "");
    setUseNativeBpAgent(business.avatarConfig?.useNativeBpAgent ?? false);
    setCrmFetch(business.webhookUrls?.crmFetch ?? business.webhookUrls?.n8nCrmFetch ?? "");
    setCrmPush(business.webhookUrls?.crmPush ?? business.webhookUrls?.n8nCrmPush ?? "");
    setSlack(business.webhookUrls?.slackHotLead ?? business.webhookUrls?.n8nSlack ?? "");
  }, [business]);

  const embedSnippet = buildEmbedSnippet(embedKey);

  function setTab(value: string) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  }

  async function handleSave() {
    if (!businessId) return;
    setSaving(true);
    try {
      const normalizedAgent = normalizeBpAgentId(bpAgentId);
      if (normalizedAgent !== bpAgentId) setBpAgentId(normalizedAgent);
      await updateBusiness({
        businessId: businessId as Id<"businesses">,
        name,
        industry: industry as Industry,
        personaTone,
        defaultLanguage,
        bpAgentId: normalizedAgent,
        useNativeBpAgent,
        webhookUrls: {
          crmFetch: crmFetch.trim() || undefined,
          crmPush: crmPush.trim() || undefined,
          slackHotLead: slack.trim() || undefined,
        },
      });
      showSuccess("Settings saved");
      if (activeTab === "avatar") void refreshBpStatus();
    } catch (e) {
      showError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const savedAgentMatch =
    bpAgentId && bpStatus?.agents?.find((a) => a.id === bpAgentId);
  const showDropdown =
    !manualBpInput &&
    bpStatus?.verified === true &&
    (bpStatus.agents?.length ?? 0) > 0;

  async function copyEmbed() {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    showSuccess("Embed snippet copied");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {!hidePageHeader ? (
        <DashboardPageHeader
          title="Settings"
          subtitle="Workspace configuration and embed details"
        />
      ) : null}

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>Tenant name and industry vertical</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="biz-name">Name</FieldLabel>
                  <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Industry</FieldLabel>
                  <Select value={industry} onValueChange={(v) => v && setIndustry(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Embed key</FieldLabel>
                  <Input value={embedKey} readOnly className="font-mono text-xs" />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleSave} disabled={saving || !businessId}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="avatar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>
                Pick a Conversational Agent from your{" "}
                <a
                  href="https://app.bey.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Beyond Presence workspace
                </a>
                . The list below comes from the API key set on the backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel>Agent</FieldLabel>
                    <div className="flex items-center gap-3 text-[11px]">
                      <button
                        type="button"
                        onClick={() => void refreshBpStatus()}
                        className="text-muted-foreground hover:text-foreground"
                        disabled={bpStatusLoading}
                      >
                        {bpStatusLoading ? "Refreshing…" : "Refresh"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualBpInput((v) => !v)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {manualBpInput ? "Use dropdown" : "Paste ID manually"}
                      </button>
                    </div>
                  </div>

                  {bpStatusError ? (
                    <p className="text-xs text-destructive">{bpStatusError}. Is the backend running?</p>
                  ) : null}

                  {bpStatus && bpStatus.configured === false ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Set <code>BEYONDPRESENCE_API_KEY</code> in <code>backend/.env.local</code> and restart the dev server.
                    </p>
                  ) : null}

                  {bpStatus && bpStatus.configured && !bpStatus.verified ? (
                    <p className="text-xs text-destructive">
                      Beyond Presence rejected the API key. Replace it in <code>backend/.env.local</code>.
                    </p>
                  ) : null}

                  {showDropdown ? (
                    <Select value={bpAgentId} onValueChange={(v) => v && setBpAgentId(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick an agent…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {bpStatus!.agents!.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="bp-id"
                      value={bpAgentId}
                      onChange={(e) => setBpAgentId(e.target.value)}
                      onBlur={(e) => setBpAgentId(normalizeBpAgentId(e.target.value))}
                      placeholder="Paste agent ID or full https://bey.chat/<id> URL"
                      className="font-mono text-xs"
                    />
                  )}

                  {bpAgentId ? (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {savedAgentMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ✓ Verified on this workspace ({savedAgentMatch.name})
                        </span>
                      ) : bpStatus?.verified ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          ⚠ Saved ID is not on this Beyond Presence workspace
                        </span>
                      ) : null}
                      <a
                        href={`https://bey.chat/${encodeURIComponent(bpAgentId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open agent page →
                      </a>
                    </div>
                  ) : null}
                </Field>
                <Field className="flex flex-row items-center justify-between gap-4 rounded-md border border-border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="use-native-bp" className="text-sm font-medium">
                      Use Beyond Presence agent config as-is
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, PresenceIQ will not overwrite your agent&apos;s system prompt or
                      greeting on each call. Use this if you configured knowledge in bey.chat.
                    </p>
                  </div>
                  <Switch
                    id="use-native-bp"
                    checked={useNativeBpAgent}
                    onCheckedChange={setUseNativeBpAgent}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="persona">Persona tone</FieldLabel>
                  <Input id="persona" value={personaTone} onChange={(e) => setPersonaTone(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lang">Default language</FieldLabel>
                  <Input id="lang" value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleSave} disabled={saving || !businessId}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>HTTPS webhook endpoints for CRM and Slack alerts (your automation runner)</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="crm-fetch">CRM fetch</FieldLabel>
                  <Input id="crm-fetch" value={crmFetch} onChange={(e) => setCrmFetch(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="crm-push">CRM push</FieldLabel>
                  <Input id="crm-push" value={crmPush} onChange={(e) => setCrmPush(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="slack">Slack alert</FieldLabel>
                  <Input id="slack" value={slack} onChange={(e) => setSlack(e.target.value)} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleSave} disabled={saving || !businessId}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed script</CardTitle>
              <CardDescription>Add to your site before closing body tag</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea readOnly value={embedSnippet} className="min-h-25 font-mono text-xs" />
            </CardContent>
            <CardFooter>
              <Button type="button" variant="secondary" onClick={copyEmbed}>
                {copied ? "Copied" : "Copy snippet"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
