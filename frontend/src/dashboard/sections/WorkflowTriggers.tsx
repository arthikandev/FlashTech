import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { TriggerRow } from "@/hooks/useTriggers";
import { showError, showSuccess } from "@/lib/toast";

type Props = {
  businessId: Id<"businesses"> | undefined;
  triggers?: TriggerRow[];
  loading?: boolean;
  canEdit: boolean;
};

const CONDITIONS = [
  { value: "intent_score_above", label: "Intent score above" },
  { value: "churn_risk_detected", label: "Churn risk detected" },
  { value: "appointment_booked", label: "Appointment booked" },
] as const;

const ACTIONS = [
  { value: "slack_alert", label: "Slack alert" },
  { value: "crm_push", label: "CRM push" },
  { value: "email_sequence", label: "Email sequence" },
] as const;

function conditionLabel(condition: string, threshold?: number) {
  const match = CONDITIONS.find((c) => c.value === condition);
  const base = match?.label ?? condition;
  if (condition === "intent_score_above" && threshold != null) {
    return `${base} ≥ ${threshold}`;
  }
  return base;
}

type TriggerFormState = {
  condition: string;
  threshold: string;
  action: string;
  webhookUrl: string;
  isActive: boolean;
};

const defaultForm: TriggerFormState = {
  condition: "intent_score_above",
  threshold: "80",
  action: "slack_alert",
  webhookUrl: "",
  isActive: true,
};

function TriggerFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: TriggerFormState;
  saving: boolean;
  onSave: (form: TriggerFormState) => void;
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FieldGroup className="mt-4">
          <Field>
            <FieldLabel>Condition</FieldLabel>
            <Select
              value={form.condition}
              onValueChange={(v) => v && setForm((f) => ({ ...f, condition: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {form.condition === "intent_score_above" && (
            <Field>
              <FieldLabel htmlFor="threshold">Threshold</FieldLabel>
              <Input
                id="threshold"
                type="number"
                min={0}
                max={100}
                value={form.threshold}
                onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
              />
            </Field>
          )}
          <Field>
            <FieldLabel>Action</FieldLabel>
            <Select
              value={form.action}
              onValueChange={(v) => v && setForm((f) => ({ ...f, action: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="webhook">Webhook URL</FieldLabel>
            <Input
              id="webhook"
              value={form.webhookUrl}
              onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
              placeholder="https://your-provider.example/webhook/..."
            />
          </Field>
          <Field className="flex flex-row items-center justify-between gap-4">
            <FieldLabel htmlFor="active">Active</FieldLabel>
            <Switch
              id="active"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
            />
          </Field>
          <Button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving || !form.webhookUrl.trim()}
          >
            {saving ? "Saving…" : "Save trigger"}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowTriggers({ businessId, triggers, loading, canEdit }: Props) {
  const upsertTrigger = useMutation(api.triggers.upsertTrigger);
  const deleteTrigger = useMutation(api.triggers.deleteTrigger);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTrigger, setEditTrigger] = useState<TriggerRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function saveTrigger(form: TriggerFormState, triggerId?: Id<"triggers">) {
    if (!businessId || !form.webhookUrl.trim()) return;
    setSaving(true);
    try {
      await upsertTrigger({
        businessId,
        triggerId,
        condition: form.condition,
        threshold:
          form.condition === "intent_score_above" ? Number(form.threshold) : undefined,
        action: form.action,
        webhookUrl: form.webhookUrl.trim(),
        isActive: form.isActive,
      });
      showSuccess(triggerId ? "Trigger updated" : "Trigger created");
      setCreateOpen(false);
      setEditTrigger(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save trigger");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(trigger: TriggerRow, isActive: boolean) {
    if (!businessId) return;
    setTogglingId(trigger._id);
    try {
      await upsertTrigger({
        businessId,
        triggerId: trigger._id,
        condition: trigger.condition,
        threshold: trigger.threshold,
        action: trigger.action,
        webhookUrl: trigger.webhookUrl,
        isActive,
      });
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to update trigger");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(trigger: TriggerRow) {
    if (!businessId) return;
    if (!window.confirm("Delete this trigger? This cannot be undone.")) return;
    try {
      await deleteTrigger({ businessId, triggerId: trigger._id });
      showSuccess("Trigger deleted");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to delete trigger");
    }
  }

  const editForm: TriggerFormState | null = editTrigger
    ? {
        condition: editTrigger.condition,
        threshold: String(editTrigger.threshold ?? 80),
        action: editTrigger.action,
        webhookUrl: editTrigger.webhookUrl,
        isActive: editTrigger.isActive,
      }
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Automation triggers</CardTitle>
          <CardDescription>HTTPS webhooks fired from the intent pipeline</CardDescription>
        </div>
        {canEdit && businessId && (
          <>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={
                  <Button type="button" size="sm" variant="outline">
                    <Plus data-icon="inline-start" />
                    Add trigger
                  </Button>
                }
              />
            </Dialog>
            <TriggerFormDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              title="New trigger"
              initial={defaultForm}
              saving={saving}
              onSave={(form) => saveTrigger(form)}
            />
            {editForm && editTrigger && (
              <TriggerFormDialog
                open={Boolean(editTrigger)}
                onOpenChange={(open) => !open && setEditTrigger(null)}
                title="Edit trigger"
                initial={editForm}
                saving={saving}
                onSave={(form) => saveTrigger(form, editTrigger._id)}
              />
            )}
          </>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !triggers?.length ? (
          <p className="text-sm text-muted-foreground">
            No triggers yet. Add one to fire Slack or CRM automations when intent spikes.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last fired</TableHead>
                {canEdit && <TableHead className="w-[120px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggers.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="text-xs">
                    {conditionLabel(t.condition, t.threshold)}
                  </TableCell>
                  <TableCell className="text-xs">{t.action}</TableCell>
                  <TableCell>
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={t.isActive}
                          disabled={togglingId === t._id}
                          onCheckedChange={(checked) => handleToggle(t, checked)}
                          aria-label={t.isActive ? "Deactivate trigger" : "Activate trigger"}
                        />
                        <Badge variant={t.isActive ? "default" : "outline"}>
                          {t.isActive ? "Active" : "Off"}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant={t.isActive ? "default" : "outline"}>
                        {t.isActive ? "Active" : "Off"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.lastFiredAt ? new Date(t.lastFiredAt).toLocaleString() : "Never"}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Edit trigger"
                          onClick={() => setEditTrigger(t)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Delete trigger"
                          onClick={() => handleDelete(t)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
