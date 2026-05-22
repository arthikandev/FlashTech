#!/usr/bin/env bash
# PresenceIQ hour-20 integration tests (bash)
# BACKEND_URL=http://localhost:3000 INBOUND_WEBHOOK_SECRET=... BP_WEBHOOK_SECRET=... ./integration-test.sh

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-}"
INBOUND_WEBHOOK_SECRET="${INBOUND_WEBHOOK_SECRET:-${N8N_WEBHOOK_SECRET:-}}"
BP_WEBHOOK_SECRET="${BP_WEBHOOK_SECRET:-}"

if [[ -z "$BACKEND_URL" ]]; then
  echo "Set BACKEND_URL" >&2
  exit 1
fi

BACKEND_URL="${BACKEND_URL%/}"
passed=0
failed=0

run_test() {
  local name="$1"
  shift
  echo ""
  echo "=== $name ==="
  if "$@"; then
    echo "PASS: $name"
    ((passed++)) || true
  else
    echo "FAIL: $name"
    ((failed++)) || true
  fi
}

test_health() {
  curl -sf "$BACKEND_URL/api/health" | grep -q '"status":"ok"'
}

test_embed() {
  local len
  len=$(curl -sf "$BACKEND_URL/api/embed/cloudmetrics-demo" | wc -c)
  [[ "$len" -gt 50 ]]
}

test_fingerprint() {
  local resp
  resp=$(curl -sf -X POST "$BACKEND_URL/api/fingerprint" \
    -H "Content-Type: application/json" \
    -d '{"embedKey":"cloudmetrics-demo","fingerprint":"demo-sarangan-fp","path":"/pricing","title":"Gold","language":"en"}')
  VISITOR_ID=$(echo "$resp" | sed -n 's/.*"visitorId":"\([^"]*\)".*/\1/p')
  BUSINESS_ID=$(echo "$resp" | sed -n 's/.*"businessId":"\([^"]*\)".*/\1/p')
  [[ -n "$VISITOR_ID" && -n "$BUSINESS_ID" ]]
}

test_pipeline() {
  local resp opener ms
  resp=$(curl -sf -X POST "$BACKEND_URL/api/pipeline" \
    -H "Content-Type: application/json" \
    -d "{\"visitorId\":\"$VISITOR_ID\",\"businessId\":\"$BUSINESS_ID\",\"waitForCrmMs\":200}")
  echo "$resp" | grep -q Sarangan || echo "WARN: opener may not mention Sarangan"
  ms=$(echo "$resp" | sed -n 's/.*"pipelineMs":\([0-9]*\).*/\1/p')
  [[ -n "$ms" && "$ms" -lt 3000 ]]
}

test_inbound_crm() {
  curl -sf -X POST "$BACKEND_URL/api/webhooks/crm-ingest" \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Secret: $INBOUND_WEBHOOK_SECRET" \
    -d "{\"visitorId\":\"$VISITOR_ID\",\"crmId\":\"CRM-001\",\"crmData\":{\"name\":\"Sarangan\",\"email\":\"t@t.com\",\"accountType\":\"prospect\",\"churnRisk\":\"low\",\"notes\":\"test\"}}"
}

test_bp_session() {
  curl -sf -X POST "$BACKEND_URL/api/webhooks/beyondpresence/session" \
    -H "Content-Type: application/json" \
    -H "X-BP-Webhook-Secret: $BP_WEBHOOK_SECRET" \
    -d "{\"visitorId\":\"$VISITOR_ID\",\"businessId\":\"$BUSINESS_ID\",\"transcript\":[{\"role\":\"user\",\"text\":\"hi\",\"timestamp\":0}],\"outcome\":\"informational\",\"sentimentArc\":[{\"turn\":1,\"score\":0.8}],\"actionItems\":[\"test\"],\"duration\":30}"
}

run_test "1. GET /api/health" test_health
run_test "2. GET /api/embed/cloudmetrics-demo" test_embed
run_test "3. POST /api/fingerprint" test_fingerprint
run_test "4. POST /api/pipeline" test_pipeline

if [[ -n "$INBOUND_WEBHOOK_SECRET" ]]; then
  run_test "5. POST /api/webhooks/crm-ingest" test_inbound_crm
else
  echo "SKIP 5: INBOUND_WEBHOOK_SECRET (or N8N_WEBHOOK_SECRET) not set"
fi

if [[ -n "$BP_WEBHOOK_SECRET" ]]; then
  run_test "7. POST /api/webhooks/beyondpresence/session" test_bp_session
else
  echo "SKIP 7: BP_WEBHOOK_SECRET not set"
fi

echo ""
echo "Passed: $passed  Failed: $failed"
echo "Steps 6, 8, 9: manual (avatar UI, Slack, dashboard)"
[[ "$failed" -eq 0 ]]
