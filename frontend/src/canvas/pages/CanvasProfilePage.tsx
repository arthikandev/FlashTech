import { UserProfile } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useTenant } from "@/tenant/TenantContext";
import { clerkEnabled } from "@/convex/api";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CanvasSubpageHeader } from "../shell/CanvasSubpageHeader";
import { t } from "../i18n/canvas.en";

export function CanvasProfilePage() {
  const { embedKey, embedOptions, onEmbedKeyChange, signedIn, business } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] space-y-8 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <CanvasSubpageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

        {clerkEnabled && signedIn ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <UserProfile routing="hash" />
          </section>
        ) : null}

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">{t("profile.workspace")}</h2>
          {embedOptions.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="workspace-select">{t("profile.switchWorkspace")}</Label>
              <Select
                value={embedKey}
                onValueChange={(key) => {
                  if (key) onEmbedKeyChange(key);
                }}
              >
                <SelectTrigger id="workspace-select">
                  <SelectValue placeholder={t("profile.selectWorkspace")} />
                </SelectTrigger>
                <SelectContent>
                  {embedOptions.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {business?.name ?? t("profile.noWorkspace")}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to={`/canvas/settings${qs}`}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              {t("profile.workspaceSettings")}
            </Link>
            <Link
              to="/onboard"
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              {t("profile.onboarding")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
