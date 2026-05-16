import { useEffect, useState } from "react";
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
import { useDashboardContext } from "../context/DashboardContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { showError, showSuccess } from "@/lib/toast";
import { getBackendBaseUrl } from "@/lib/backendUrl";

const INDUSTRIES = [
  { value: "bank", label: "Bank" },
  { value: "saas", label: "SaaS" },
  { value: "hotel", label: "Hotel" },
  { value: "hospital", label: "Hospital" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "hr", label: "HR" },
] as const;

export function SettingsPage() {
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
    setCrmFetch(business.webhookUrls?.n8nCrmFetch ?? "");
    setCrmPush(business.webhookUrls?.n8nCrmPush ?? "");
    setSlack(business.webhookUrls?.n8nSlack ?? "");
  }, [business]);

  const embedSnippet = `<script src="${getBackendBaseUrl()}/api/embed/${embedKey}" async></script>`;

  async function handleSave() {
    if (!businessId) return;
    setSaving(true);
    try {
      await updateBusiness({
        businessId: businessId as Id<"businesses">,
        name,
        industry: industry as (typeof INDUSTRIES)[number]["value"],
        personaTone,
        defaultLanguage,
        bpAgentId,
        webhookUrls: {
          n8nCrmFetch: crmFetch.trim() || undefined,
          n8nCrmPush: crmPush.trim() || undefined,
          n8nSlack: slack.trim() || undefined,
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
      <DashboardPageHeader
        title="Settings"
        subtitle="Workspace configuration and embed details"
      />

      {signedIn && needsMembership && (
        <Button type="button" variant="outline" onClick={linkToCurrentBusiness} disabled={linking}>
          {linking ? "Linking…" : "Link account to this workspace"}
        </Button>
      )}

      <Tabs defaultValue="business">
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
              <CardDescription>Beyond Presence agent and persona</CardDescription>
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
              <CardDescription>n8n automation endpoints for this workspace</CardDescription>
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
