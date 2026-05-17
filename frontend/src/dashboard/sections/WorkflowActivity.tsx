import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TriggerRow } from "@/hooks/useTriggers";
import { computeWorkflowSteps } from "@/lib/dashboard/workflowSteps";

type Props = {
  hasIntelligence: boolean;
  hasConversation: boolean;
  hasCrmData: boolean;
  hasBpAgent: boolean;
  triggers?: TriggerRow[];
  triggersLoading?: boolean;
};

export function WorkflowActivity({
  hasIntelligence,
  hasConversation,
  hasCrmData,
  hasBpAgent,
  triggers,
  triggersLoading,
}: Props) {
  const steps = computeWorkflowSteps({
    hasIntelligence,
    hasConversation,
    hasCrmData,
    hasBpAgent,
    triggers,
  });
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline status</CardTitle>
        <CardDescription>End-to-end automation from visitor webhooks</CardDescription>
      </CardHeader>
      <CardContent>
        {triggersLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="flex min-w-[560px] items-center gap-2 overflow-x-auto">
              {steps.map((step, i) => (
                <div key={step.key} className="flex min-w-0 flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border-2 ${
                        step.done
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.done ? <Check /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <p
                      className={`mt-2 text-center text-[10px] uppercase tracking-wide ${
                        step.done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.detail ? (
                      <Badge variant="secondary" className="mt-1 text-[9px]">
                        {step.detail}
                      </Badge>
                    ) : null}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 rounded ${
                        steps[i + 1]?.done || step.done ? "bg-primary/50" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {completedCount}/{steps.length} pipeline steps active
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
