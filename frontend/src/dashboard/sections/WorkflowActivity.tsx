import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/LoadingState";
import type { TriggerRow } from "@/hooks/useTriggers";

const STEPS = [
  { key: "crm", label: "CRM fetch" },
  { key: "intent", label: "Intent scoring" },
  { key: "bp", label: "BP agent sync" },
  { key: "slack", label: "Slack alert" },
  { key: "email", label: "Email follow-up" },
] as const;

type Props = {
  hasIntelligence: boolean;
  hasConversation: boolean;
  triggers?: TriggerRow[];
  triggersLoading?: boolean;
};

export function WorkflowActivity({
  hasIntelligence,
  hasConversation,
  triggers,
  triggersLoading,
}: Props) {
  const firedSlack = triggers?.some(
    (t) => t.action === "slack_alert" && t.lastFiredAt != null
  );
  const firedCrm = triggers?.some(
    (t) => t.action === "crm_push" && t.lastFiredAt != null
  );

  const stepDone: Record<string, boolean> = {
    crm: hasIntelligence,
    intent: hasIntelligence,
    bp: hasIntelligence,
    slack: firedSlack ?? (hasIntelligence && (triggers?.length ?? 0) > 0),
    email: firedCrm ?? hasConversation,
  };

  const completedCount = STEPS.filter((s) => stepDone[s.key]).length;

  return (
    <section id="workflow">
      <SectionHeading
        title="AI Workflow Activity"
        subtitle="n8n automation pipeline status"
        align="left"
        compact
      />
      {triggersLoading ? (
        <LoadingState variant="inline" label="Loading workflow triggers…" />
      ) : (
        <div className="rounded-xl border border-[#212121] glass-panel p-6 overflow-x-auto">
          <motion.div className="flex items-center gap-2 min-w-[600px]">
            {STEPS.map((step, i) => {
              const done = stepDone[step.key];
              const trigger = triggers?.find((t) =>
                step.key === "slack"
                  ? t.action === "slack_alert"
                  : step.key === "email"
                    ? t.action === "crm_push" || t.action === "email_sequence"
                    : false
              );
              return (
                <div key={step.key} className="flex items-center flex-1 min-w-0">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        done
                          ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(222,219,200,0.2)]"
                          : "border-[#212121] bg-[#101010] text-gray-600"
                      }`}
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{i + 1}</span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-[10px] text-center uppercase tracking-wide ${
                        done ? "text-[#E1E0CC]" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    {trigger?.lastFiredAt ? (
                      <p className="text-[9px] text-gray-600 mt-0.5">
                        Last fired {new Date(trigger.lastFiredAt).toLocaleTimeString()}
                      </p>
                    ) : null}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 rounded ${
                        stepDone[STEPS[i + 1].key] || done
                          ? "bg-primary/50"
                          : "bg-[#212121]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
          <p className="mt-4 text-xs text-gray-600">
            {completedCount}/{STEPS.length} pipeline steps active · Beyond Presence sync on
            intelligence
          </p>
        </div>
      )}
    </section>
  );
}
