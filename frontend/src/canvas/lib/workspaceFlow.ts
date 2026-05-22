/**
 * Canvas workspace logic (PresenceIQ `/canvas`).
 *
 * **Routing**
 * - `CanvasRoute` — ProtectedRoute → WorkspaceAuthGate (Clerk↔Convex) → TenantProvider(embedKey from URL)
 *   → WorkspaceGate → child routes inside `CanvasShell`.
 * - `CanvasShell` — `IntegrationHealthProvider` (one `/api/health?probes=1` poll), header, sidebar, `<Outlet />`.
 *
 * **Live advisor (index)** — `CanvasWorkspacePage`
 * - `useComposerPipeline(embedKey)`:
 *   1. `POST /api/canvas/operator-session` → visitorId, businessId
 *   2. Writes `window.__piq_last` and dispatches `presenceiq:ready`
 *   3. Avatar SDK loads → `POST /api/pipeline` with optional `operatorMessage`
 *   4. OpenAI scores intent → `personalisedOpener`; UI shows opener + BP iframe when session active
 * - Sends are blocked unless Convex+OpenAI probes pass (`canRunIntelligence`) and workspace has `businessId`.
 *
 * Keep orchestration hooks thin; backend + `avatar/` bundle own persistence and BP sync details.
 */

export type AdvisorScenarioGate = {
  hasBusinessId: boolean;
  intelligenceReady: boolean;
  creditsExhausted: boolean;
  promptTrimmedLength: number;
};

export function canSubmitAdvisorScenario(g: AdvisorScenarioGate): boolean {
  return (
    g.promptTrimmedLength > 0 &&
    !g.creditsExhausted &&
    g.intelligenceReady &&
    g.hasBusinessId
  );
}

/** Live advisor send uses intelligence only; ElevenLabs is optional for voice catalog. */
export function advisorRequiresElevenLabs(): boolean {
  return false;
}
