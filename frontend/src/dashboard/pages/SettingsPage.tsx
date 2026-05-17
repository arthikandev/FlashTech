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

  const {
    business,
    businessId,
    embedKey,
    signedIn,
    needsMembership,
    linkToCurrentBusiness,
    linking,
  } = useDashboardContext();
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
      await updateBusiness({
        businessId: businessId as Id<"businesses">,
        name,
        industry: industry as Industry,
        personaTone,
        defaultLanguage,
        bpAgentId,
        useNativeBpAgent,
        webhookUrls: {
          crmFetch: crmFetch.trim() || undefined,
          crmPush: crmPush.trim() || undefined,
          slackHotLead: slack.trim() || undefined,
        },
      });
      showSuccess("Settings saved");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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

      {signedIn && needsMembership && (
        <Button type="button" variant="outline" onClick={linkToCurrentBusiness} disabled={linking}>
          {linking ? "Linking…" : "Link account to this workspace"}
        </Button>
      )}

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
                Agent ID from{" "}
                <a
                  href="https://app.bey.chat/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Beyond Presence settings
                </a>
                . Backend sync uses your workspace API key.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="bp-id">Agent ID</FieldLabel>
                  <Input
                    id="bp-id"
                    value={bpAgentId}
                    onChange={(e) => setBpAgentId(e.target.value)}
                    className="font-mono text-xs"
                  />
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
              <Textarea readOnly value={embedSnippet} className="min-h-[100px] font-mono text-xs" />
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
