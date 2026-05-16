# PresenceIQ API Contract

**Base URL**: `http://localhost:3000` (dev) · `https://<vercel-app>.vercel.app` (prod)  
**Maintained by**: Person 2 (Backend)

---

## Embed

```html
<script src="{BASE_URL}/api/embed/seylan-demo" async></script>
```

**Event** (after fingerprint):

```javascript
window.addEventListener("presenceiq:ready", (e) => {
  const { visitorId, businessId, sessionId } = e.detail;
});
```

---

## POST /api/fingerprint

Register or update visitor.

**Body**:

```json
{
  "embedKey": "seylan-demo",
  "fingerprint": "abc123",
  "path": "/pricing",
  "title": "Gold vs Platinum",
  "language": "en",
  "referrer": "https://google.com"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "visitorId": "...",
    "businessId": "...",
    "returnCount": 4,
    "isKnownVisitor": true,
    "crmId": "CRM-001"
  }
}
```

---

## POST /api/intent

Score visitor intent (GPT-4o). Requires `OPENAI_API_KEY` or returns demo fallback for seeded Sarangan.

**Body**: `{ "visitorId": "...", "businessId": "..." }`

**Response 200**:

```json
{
  "success": true,
  "data": {
    "intentScore": 96,
    "personalisedOpener": "Welcome back Sarangan — ...",
    "recommendedAction": "Offer account opening walkthrough",
    "signals": ["return_visitor", "pricing_page_x3"],
    "computedAt": 1715854321000
  }
}
```

---

## POST /api/pipeline

**Person 1** calls this after `presenceiq:ready`. Waits for CRM (optional) then scores intent.

**Body**:

```json
{
  "visitorId": "...",
  "businessId": "...",
  "waitForCrmMs": 500
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "intelligence": { "intentScore": 96, "personalisedOpener": "...", "recommendedAction": "...", "signals": [], "computedAt": 0 },
    "visitor": { "name": "Sarangan", "language": "en", "crmId": "CRM-001" },
    "business": { "name": "Seylan Bank", "industry": "bank", "personaTone": "formal" },
    "bpAgentId": "agent_abc123",
    "beyondPresence": { "synced": true },
    "pipelineMs": 450
  }
}
```

When `BEYONDPRESENCE_API_KEY` or `bpAgentId` is missing, `beyondPresence` is `{ "synced": false, "reason": "..." }` and pipeline still returns 200.

---

## GET /api/beyondpresence/status

Verify Beyond Presence API key (server-side). No auth header required.

**Response 200** (configured):

```json
{
  "configured": true,
  "verified": true,
  "agentCount": 1,
  "agents": [{ "id": "agent_...", "name": "Seylan Assistant" }]
}
```

**Response 200** (not configured):

```json
{
  "configured": false,
  "verified": false,
  "message": "Set BEYONDPRESENCE_API_KEY in backend/.env.local"
}
```

See [BEYOND_PRESENCE.md](BEYOND_PRESENCE.md).

---

## POST /api/webhooks/n8n/crm

**Header**: `X-Webhook-Secret: {N8N_WEBHOOK_SECRET}`

**Body**:

```json
{
  "visitorId": "...",
  "crmId": "CRM-001",
  "crmData": {
    "name": "Sarangan",
    "email": "sarangan@example.com",
    "accountType": "prospect",
    "churnRisk": "low",
    "notes": "Compared Gold and Platinum plans 3 times this week"
  }
}
```

---

## POST /api/webhooks/beyondpresence/session

**Header**: `X-BP-Webhook-Secret: {BP_WEBHOOK_SECRET}`

**Body**:

```json
{
  "visitorId": "...",
  "businessId": "...",
  "transcript": [{ "role": "user", "text": "Yes, open account", "timestamp": 0 }],
  "outcome": "converted",
  "sentimentArc": [{ "turn": 1, "score": 0.8 }],
  "actionItems": ["Send account form"],
  "duration": 45
}
```

Fires hot-lead Slack trigger when latest `intentScore > 80`.

---

## Convex queries (Person 3 dashboard)

**Auth:** Dashboard queries require Clerk sign-in (`ConvexProviderWithClerk`) and a `businessMembers` row for the target business. Set `CLERK_JWT_ISSUER_DOMAIN` on the Convex deployment — see [ENV.md](ENV.md).

| Query | Auth | Args | Returns |
|-------|------|------|---------|
| `intelligence.listLiveSessions` | Required | `{ businessId }` | Sessions with latest scores |
| `intelligence.getSessionDetail` | Required | `{ visitorId }` | Visitor + intelligence + conversation |
| `intelligence.listByBusiness` | Required | `{ businessId }` | Intelligence rows for business |
| `intelligence.getIntelligenceForAvatar` | Public | `{ visitorId }` | Latest intelligence for Person 1 |
| `businessMembers.listForCurrentUser` | Required | `{}` | Businesses the signed-in user can access |
| `businessMembers.linkCurrentUser` | Required | `{ businessId, role? }` | Link current user to a business |

**Convex URL**: set `NEXT_PUBLIC_CONVEX_URL` / `VITE_CONVEX_URL`  
**Clerk (frontend):** `VITE_CLERK_PUBLISHABLE_KEY`

---

## Fake CRM (n8n / Person 3)

```json
{
  "CRM-001": {
    "name": "Sarangan",
    "email": "sarangan@example.com",
    "accountType": "prospect",
    "churnRisk": "low",
    "notes": "Compared Gold and Platinum plans 3 times this week"
  }
}
```

---

## Seylan sandbox (CRM test)

Server-side proxy to hackathon sandbox. Requires `SEYLAN_API_BASE_URL` + `SEYLAN_API_KEY` in `backend/.env.local`.

**GET** `/api/seylan/account-inquiry` — config + reachability

**POST** `/api/seylan/account-inquiry`

```json
{ "accountNumber": "064000012548001" }
```

Fingerprint CRM order: n8n → Seylan sandbox → built-in demo mock.

**Automation (server-side):**
- `POST /api/pipeline` — if `intentScore >= 80`, fires `N8N_WEBHOOK_SLACK` (hot-lead)
- `POST /api/webhooks/beyondpresence/session` — fires triggers, Slack, `N8N_WEBHOOK_CRM_PUSH`

---

## POST /api/businesses/onboard

Create a new tenant and return embed snippet (PDF onboarding wizard).

**Body**:

```json
{
  "name": "Acme Bank",
  "industry": "bank",
  "personaTone": "professional",
  "defaultLanguage": "en",
  "embedKey": "acme-bank"
}
```

`industry`: `bank` | `saas` | `hotel` | `hospital` | `ecommerce` | `hr`

**Response 200**:

```json
{
  "success": true,
  "data": {
    "businessId": "...",
    "embedKey": "acme-bank",
    "embedSnippet": "<script src=\"{BASE}/api/embed/acme-bank\" async></script>",
    "embedUrl": "{BASE}/api/embed/acme-bank",
    "dashboardHint": "npx convex run seed:seedDemo ..."
  }
}
```

---

## Embed keys

| Site | embedKey |
|------|----------|
| Seylan Bank | `seylan-demo` |
| CloudMetrics SaaS | `cloudmetrics-demo` |
| Coral Resort | `coral-demo` |
