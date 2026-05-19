# PresenceIQ — System Workflow & Algorithms

Read [ARCHITECTURE.md](ARCHITECTURE.md) first for the component map. This doc
walks every flow with pseudo-code, timing budgets, and failure modes so a new
contributor can trace any code path end-to-end.

---

## 1. System topology

```
+-----------------------+        +--------------------------+
| Browser SPA (Vite)    |        | External embed website   |
|  - canvas workspace   |        |  - <script presenceiq>   |
+-----------+-----------+        +-------------+------------+
            |                                  |
            |  (window events)                 |
            v                                  v
        +---+----------------------------------+---+
        | avatar/presenceiq-avatar.js (IIFE SDK)   |
        | mounts BeyondPresence iframe + events    |
        +-------+--------------------------+-------+
                |                          |
                | POST /api/pipeline       | POST /api/fingerprint
                v                          v
        +-------+--------------------------+-------+
        |  Next.js API (backend/src/app/api/*)     |
        |  rate-limit -> credit -> intent -> sync  |
        +---+----+---------+--------+--------+-----+
            |    |         |        |        |
            v    v         v        v        v
        Convex  OpenAI   Beyond-  ElevenL.  n8n / Slack
        (DB)    (gpt-   Presence  (voice    (webhooks)
                4o*)    (avatar)  pick)
```

Clerk JWTs flow `Browser -> Convex.auth.config -> requireBusinessMember()`.
The Vite SPA also forwards Clerk identity to Next.js routes for member-gated
mutations (e.g. dashboard writes); the embed script and `/api/pipeline` are
public.

---

## 2. Flow: Authentication & tenant resolution

**Trigger:** anything that needs an `embedKey` (canvas open, dashboard load,
member-gated mutation).

**Decision tree (frontend):**

```
on TenantContext mount:
  if URL has ?embedKey=X     -> use X
  elif user signed in        -> query businessMembers.listForCurrentUser
                                 pick first membership (or last-used)
  else                       -> use DEMO_EMBED_KEY (read-only preview)
```

**Backend guard (Convex):**

```
requireBusinessMember(ctx, embedKey):
  identity = ctx.auth.getUserIdentity()  // null for anon
  if !identity: throw "Unauthenticated"
  member = db.query('businessMembers')
             .by_clerk(identity.subject)
             .filter(embedKey)
  if !member: throw "Not a member of this workspace"
  return { business, member }
```

**Files:**
[frontend/src/tenant/TenantContext.tsx](../frontend/src/tenant/TenantContext.tsx),
[backend/convex/lib/auth.ts](../backend/convex/lib/auth.ts),
[backend/convex/auth.config.ts](../backend/convex/auth.config.ts).

**Failure modes:** Clerk unreachable → anonymous demo-only path; user not in
`businessMembers` → 401 from mutation, UI shows "no workspace".

---

## 3. Flow: Visitor fingerprint & CRM enrichment

**Trigger:** page load on an embed site or canvas dev session.

```
POST /api/fingerprint { embedKey, fingerprint, page, referrer, lang }
  -> visitors.upsertFingerprint  // Convex mutation
     - upsert by (businessId, fingerprint)
     - append page to pageHistory (cap N)
     - bump returnCount if existing
  <- { visitorId }

// async, parallel:
triggerCrmFetchAutomation(visitorId, fingerprint, businessId)
  -> POST tenant.webhookUrls.crmFetch (or env fallback)
  // n8n / external tool calls back later:
POST /api/webhooks/crm-ingest { visitorId, crmData, signature }
  -> verifies INBOUND_WEBHOOK_SECRET
  -> visitors.patchCrmData(visitorId, crmData)
```

**Algorithm — `waitForCrmData(visitorId, waitMs)`**
([backend/src/lib/pipeline.ts](../backend/src/lib/pipeline.ts)): polls Convex
every 50 ms until either `visitor.crmData.name` appears or the deadline
passes. The 50 ms cadence trades a few wasted reads for low p95 latency on
warm CRM hits; pipeline default `waitForCrmMs = 200`. Switching to an
event-driven wait would require a Convex live subscription — kept polled for
simplicity and predictable upper bound.

**Failure modes:** n8n down → CRM never patches; pipeline still runs and
falls back to `crmData = undefined` (visitor name "guest").

---

## 4. Flow: Pre-conversation pipeline — the main event

`POST /api/pipeline`
([backend/src/app/api/pipeline/route.ts](../backend/src/app/api/pipeline/route.ts))
as a numbered state machine. Hard ceiling
`PRESENCEIQ_PIPELINE_CEILING_MS` (default 1500 ms).

```
0.  ip = x-forwarded-for
    if !rateLimit("pipeline:ip:"+ip): 429
1.  body = zod.parse({ visitorId, businessId, waitForCrmMs?, operatorMessage? })
    if !rateLimit("pipeline:tenant:"+businessId+":"+ip): 429
2.  waitForCrmData(visitorId, body.waitForCrmMs)         // ~0-200 ms
3.  usage = usage.checkAndConsume(businessId, "intelligence_call")
    if CreditsExhausted: 402
    model = usage.model                                   // tier-driven
4.  { intelligence, visitor, business } =
        runIntentPipeline(visitorId, businessId, { operatorMessage, model })
    // -> scoreIntent (OpenAI 1200ms abort) or heuristic
    // -> saveIntelligenceAsync (fire-and-forget Convex insert)
5.  automation = runPipelineAutomation({ visitor, business, intelligence })
    // parallel webhook fan-out, best-effort
6.  voiceTone   = intentToVoiceTone(intentScore, industry, churnRisk)
    personaTone = business.avatarConfig.personaTone ?? toneToPersonaHint(...)
    voiceSel    = selectVoiceForContext({ industry, language, tone })
7.  knowledgeContext = pickKnowledgeContextAsync({ chunks, pageHistory, crmNotes })
8.  beyondPresence = race(
        syncAgentFromIntelligence(...) ,
        sleep(PIPELINE_CEILING_MS - elapsed)
    )
    // if sleep wins: PATCH continues in background, response says "pending"
9.  syncStatus = resolveSyncStatus({ result: beyondPresence, bpAgentId })
10. respond { intelligence, syncStatus, voice, beyondPresence, timing, automation }
```

**Timing budget (typical warm path, ms):**

| Step | Budget | Notes |
| --- | --- | --- |
| 2  CRM wait | 0–200 | short-circuits as soon as crmData appears |
| 3  Credit consume | 5–30 | Convex round-trip |
| 4  Intent score | 200–900 | OpenAI; cap = `OPENAI_TIMEOUT_MS` (1200) → fallback |
| 5  Automation | 50–400 | parallel webhooks, each capped at 2 000 ms |
| 8  BP PATCH | remainder | races the rest of the budget, then defers |

**Failure modes:**

- OpenAI timeout / no key in dev → `heuristicIntentFallback` with
  `"heuristic_fallback"` signal.
- BP slow → `syncStatus = "pending"`, async log on settle.
- Webhook slow → individual `AbortError`, logged as
  `event: "webhook_timeout"`, pipeline returns normally.
- `saveIntelligenceAsync` fails → logged as `save_intelligence_failed`; the
  response to the client still includes the in-memory `intelligence` object.

---

## 5. Algorithm: Intent scoring

**File:** [backend/src/lib/openai.ts](../backend/src/lib/openai.ts).

```
scoreIntent(ctx):
  // 5.1 demo-fixture short-circuit (gated)
  if ALLOW_DEMO_FIXTURES and
     (ctx.fingerprint == "demo-sarangan-fp" or ctx.visitorName ~= "sarangan"):
       return DEMO_SARANGAN_INTELLIGENCE

  // 5.2 cache lookup (60 s TTL)
  opHash = sha1(operatorMessage).slice(0,12)  or "none"
  if ctx.visitorId:
    if opHash == "none":
        c = Convex.intelligence.getLatestByVisitor(visitorId)
        if c and age < 60s: return c + ["cached"]
    else:
        c = inProcessMap[(visitorId, opHash)]
        if c and not expired: return c + ["cached"]

  // 5.3 OpenAI call with AbortController (1200 ms)
  try:
    controller = new AbortController()
    timer = setTimeout(controller.abort, OPENAI_TIMEOUT_MS)
    out = openai.chat.completions.create({
        model: ctx.model or "gpt-4o-mini",
        response_format: json_object,
        messages: [SYSTEM_PROMPT, buildUserPrompt(ctx)],
    }, { signal: controller.signal })
    clearTimeout(timer)
    parsed = intentSchema.safeParse(out.choices[0].message.content)
    if opHash != "none" and ctx.visitorId: writeOperatorCache(...)
    return parsed.data
  catch (abort | parse | network):
    log warn
    return heuristicIntentFallback(ctx)
```

**OpenAI inputs (`buildUserPrompt`):** industry, business name, visitor name,
return count, language, time on site (s), pages-visited summary
(`/path (xN)` when revisited), CRM notes, churn risk, optional operator test
prompt.

**Heuristic fallback** (no key / timeout / parse error):

```
pricingHits = count(pageHistory.path ~= /pricing/)
score       = min(70 + returnCount*5 + pricingHits*5, 95)
opener      = "Welcome back {name} — how can I help you today?"
              + (pricingHits>0 ? " I can walk you through our plan options." : "")
signals     = ["heuristic_fallback"]
              + (pricingHits>0 ? ["pricing_interest"] : [])
action      = pricingHits>0 ? "Compare plan options with visitor"
                            : "Continue conversation"
```

**Signals taxonomy** ([backend/src/lib/types.ts](../backend/src/lib/types.ts)):

```
type KnownIntelligenceSignal =
  | "cached"             // served from cache, not freshly scored
  | "heuristic_fallback" // OpenAI unavailable, rules used
  | "pricing_interest"   // pricing page seen
  | "return_visitor"
  | "high_engagement"
type IntelligenceSignal = KnownIntelligenceSignal | (string & {})
```

The `(string & {})` keeps the union *open* so OpenAI-generated tags
(e.g. `"return_visitor_3x"`) still type-check while autocompleting the canonical
set in editor and lint.

**Cache eviction:** Convex cache returns at most the latest row regardless of
operatorMessage; the in-process operator cache lives only as long as the
serverless instance and expires after 60 s. Cold-start invocations always go
to OpenAI.

---

## 6. Algorithm: BeyondPresence sync (pipeline-ceiling race)

The most subtle algorithm in the system. Lives in
[backend/src/app/api/pipeline/route.ts](../backend/src/app/api/pipeline/route.ts)
with the status mapping in
[backend/src/lib/beyondPresenceApi.ts](../backend/src/lib/beyondPresenceApi.ts).

```
remaining = PIPELINE_CEILING_MS - (now - started)

if useNativeBpAgent && bpAgentId:
    bp = { synced: false, reason: "native BP agent — using bey.chat config" }
elif !bpAgentId:
    bp = { synced: false, reason: "bpAgentId not set on business" }
elif remaining <= 0:
    bp = { synced: false, reason: "Beyond Presence sync skipped (pipeline ceiling)" }
    fire-and-log bpPromise
else:
    bp = race(
        syncAgentFromIntelligence({...}),
        sleep(remaining).then("Beyond Presence sync deferred (pipeline ceiling)")
    )
    if bp.reason contains "deferred":
        fire-and-log bpPromise.then(...)  // settle in background

// always:
syncStatus = resolveSyncStatus({ result: bp, bpAgentId })
```

**`resolveSyncStatus` truth table:**

| `synced` | `reason` contains | `bpAgentId` set | -> status |
| --- | --- | --- | --- |
| true | — | — | `complete` |
| false | `native BP agent` | — | `complete` |
| false | (any) | no | `pending` |
| false | `deferred` / `skipped` | yes | `pending` |
| false | other | yes | `failed` |

The SDK uses `syncStatus` to decide whether to render the live opener
(`complete`), fall back to a generic greeting (`pending`), or surface an
error toast (`failed`).

---

## 7. Algorithm: Automation dispatcher

[backend/src/lib/automation.ts](../backend/src/lib/automation.ts) +
[backend/src/lib/webhookUrlsResolve.ts](../backend/src/lib/webhookUrlsResolve.ts).

**Webhook URL resolution:** tenant value
(`business.webhookUrls.<channel>`) wins; otherwise fall back to env defaults
(`WEBHOOK_*` or legacy `N8N_WEBHOOK_*`). Single helper for each channel —
slack hot-lead, CRM push, CRM fetch, churn workflow.

**Fan-out** (after intent scoring):

```
runPipelineAutomation({ visitor, business, intelligence }):
  jobs = []
  if intentScore >= business.hotLeadThreshold:
    jobs.push(fireSlackWebhook(...))
  if churnRisk == "high":
    jobs.push(fireChurnWebhook(...))
  jobs.push(forwardCrmPush(...))  // always log to CRM
  await Promise.allSettled(jobs)  // best-effort
  return { fired: jobs.length, results }
```

**Per-webhook safety** (added in this revision): every outbound `fetch`
inside [backend/src/lib/pipeline.ts](../backend/src/lib/pipeline.ts) carries
`AbortSignal.timeout(2000)`. Aborted calls log a structured
`webhook_timeout` event and the pipeline continues.

---

## 8. Flow: Embed lifecycle (`avatar/presenceiq-avatar.js`)

Browser-side state machine emitted as DOM events on `window`:

```
script tag loads
  -> SDK boots, reads data-* attrs and (window.PresenceIQAvatar.init || data)
  -> emits "presenceiq:loaded"
  -> waits for "presenceiq:ready" from page or canvas consumer
        detail: { visitorId, businessId, sessionId, operatorMessage? }
  -> POST /api/pipeline with detail
  -> on response: PATCH BP agent greeting (if syncStatus complete)
                  mount BP iframe
                  play opener via ElevenLabs (or BP native voice)
  -> emits one of:
       presenceiq:pipeline-complete  { intelligence, syncStatus }
       presenceiq:pipeline-error     { error }
       presenceiq:avatar-fallback    { reason }
  -> on session end: POST /api/webhooks/beyondpresence/session
                     with conversation transcript
```

Frontend consumer:
[frontend/src/canvas/hooks/useComposerPipeline.ts](../frontend/src/canvas/hooks/useComposerPipeline.ts)
listens for those three events to drive UI state. The hook now uses an
`AbortController` per send and a `sendingRef` guard so rapid Send clicks
cannot queue overlapping operator sessions.

---

## 9. Flow: Post-call analysis & conversation persistence

```
POST /api/webhooks/beyondpresence/session
  verify BP_WEBHOOK_SECRET
  transcript = body.turns
  analysis = analyzePostCallSession({
      transcript, preIntentScore, visitorName, businessName
  })
  // gpt-4o, JSON: { outcome, summary, actionItems, sentimentArc[turn,score] }
  conversations.saveConversation(visitorId, businessId, transcript, analysis)
  triggers.evaluateAndFire(business, intelligence, analysis)
      // POST every active trigger.webhookUrl whose condition matches
```

Outcomes: `converted | escalated | abandoned | informational`.

---

## 10. Flow: Canvas composer (operator demo path)

```
operator types text and clicks Send
  -> useComposerPipeline.send(operatorMessage, bpAgentId?)
     - dedupe: sendingRef bail
     - abort previous in-flight fetch
     - ensureCanvasAvatarInitialized(bpAgentId)
     - POST /api/canvas/operator-session { embedKey }
            <- { visitorId, businessId, fingerprint }
     - window.dispatchEvent("presenceiq:ready",
         { visitorId, businessId, sessionId, operatorMessage })
  -> SDK picks up event, runs the same /api/pipeline flow as embed
  -> hook listens for "presenceiq:pipeline-complete" -> setLastOpener
```

`operatorMessage` flows through `scoreIntent` as the
"Operator test prompt (incorporate into personalisedOpener when relevant)"
user-message line, and seeds the in-process operator cache so a second send
of the identical text inside 60 s returns the cached opener with the
`cached` signal.

---

## 11. Reference: `bpAgent` defaults

[backend/convex/lib/bpAgentDefaults.ts](../backend/convex/lib/bpAgentDefaults.ts)
defines two UUIDs:

- `CANONICAL_BP_AGENT_ID` — current bundled default; assigned to any new
  business that saves knowledge chunks for the first time without an explicit
  agent id.
- `LEGACY_BP_AGENT_ID` — used purely to recognise pre-migration rows; not
  written to new businesses.

`business.avatarConfig.useNativeBpAgent === true` short-circuits step 8 of
the pipeline: PresenceIQ skips the PATCH so bey.chat's own system-prompt and
greeting are used verbatim.

---

## 12. Failure-mode matrix

| Dependency | If it fails | Pipeline behavior |
| --- | --- | --- |
| Clerk | Anon path only; member-gated mutations 401 | embed/pipeline still serves demo tenant |
| Convex | 5xx from any query/mutation | `/api/pipeline` → 500 |
| OpenAI | Timeout / parse / no key | `heuristicIntentFallback`, signal `heuristic_fallback` |
| BeyondPresence | Slow PATCH | `syncStatus = "pending"`, async settle log |
| BeyondPresence | Wrong agent / HTTP error | `syncStatus = "failed"`, SDK toast |
| ElevenLabs | Voice lookup fails | falls back to BP native voice |
| n8n / Slack / CRM webhook | Slow or 5xx | `event: "webhook_timeout"` log, pipeline OK |
| Inbound CRM webhook | Bad signature | 401, visitor.crmData stays unset |
| Credits | Period exhausted | `/api/pipeline` returns 402 immediately |

---

## 13. Verification checklist

The end-to-end + targeted tests live in the parent plan
(`fully-deatile-my-over-silly-barto.md`). Key signals to look for:

- `event: "pipeline_timing"` log entry includes `cacheHit` true on the second
  identical operator send.
- `event: "bp_patch_async_complete"` appears in logs when BP PATCH wins the
  background race after `syncStatus = "pending"`.
- `event: "webhook_timeout"` appears when a downstream webhook is slower
  than 2 000 ms; the user-facing pipeline still returns inside the ceiling.
- Sending as visitor named "sarangan" with
  `PRESENCEIQ_ALLOW_DEMO_FIXTURES` unset returns a freshly-scored
  intelligence (not the canned 96).
