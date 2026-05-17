/**
 * Canvas day-1 workflow: operator session → pipeline → avatar → automation → embed.
 */

export const OPTIONAL_BACKEND_ENV_VARS = ["ELEVENLABS_API_KEY"] as const;

export type CanvasWorkflowStep = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  optional?: boolean;
  href?: (qs: string) => string;
};

export type CanvasWorkflowInput = {
  hasBusinessId: boolean;
  intelligenceReady: boolean;
  liveStackReady: boolean;
  elevenLabsOk: boolean;
  bpAgentConfigured: boolean;
  webhooksConfigured: number;
  webhooksTotal: number;
};

export function computeCanvasWorkflowSteps(input: CanvasWorkflowInput): CanvasWorkflowStep[] {
  const qs = (path: string) => path;

  return [
    {
      id: "workspace",
      label: "Workspace linked",
      description: "Convex business record for this embed key",
      done: input.hasBusinessId,
      href: () => qs("/onboard"),
    },
    {
      id: "intelligence",
      label: "Intent pipeline",
      description: "Convex + OpenAI — personalised opener on Live advisor",
      done: input.intelligenceReady,
      href: (q) => `/canvas/help${q}`,
    },
    {
      id: "avatar",
      label: "Live avatar",
      description: "Beyond Presence agent synced from workspace settings",
      done: input.liveStackReady && input.bpAgentConfigured,
      href: (q) => `/canvas/settings${q}${q.includes("?") ? "&" : "?"}tab=avatar`,
    },
    {
      id: "voice",
      label: "ElevenLabs voice",
      description: "Optional — voice catalog and health probe (restart backend after .env.local)",
      done: input.elevenLabsOk,
      optional: true,
      href: (q) => `/canvas/help${q}`,
    },
    {
      id: "automation",
      label: "Automation webhooks",
      description: "CRM fetch/push and Slack when intent crosses thresholds",
      done: input.webhooksConfigured > 0,
      href: (q) => `/canvas/webhooks${q}`,
    },
    {
      id: "embed",
      label: "Embed on your site",
      description: "Script tag before </body> on your marketing site",
      done: false,
      href: (q) => `/canvas/embed${q}`,
    },
  ];
}

export function canvasWorkflowProgress(steps: CanvasWorkflowStep[]): {
  done: number;
  total: number;
  requiredDone: number;
  requiredTotal: number;
} {
  const required = steps.filter((s) => !s.optional);
  return {
    done: steps.filter((s) => s.done).length,
    total: steps.length,
    requiredDone: required.filter((s) => s.done).length,
    requiredTotal: required.length,
  };
}
