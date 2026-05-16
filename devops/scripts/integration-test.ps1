# PresenceIQ hour-20 integration tests (PowerShell)
param(
  [string]$BackendUrl = $env:BACKEND_URL,
  [string]$N8nSecret = $env:N8N_WEBHOOK_SECRET,
  [string]$BpSecret = $env:BP_WEBHOOK_SECRET
)
if (-not $BackendUrl) { Write-Error "Set BACKEND_URL"; exit 1 }
$BackendUrl = $BackendUrl.TrimEnd("/")
$passed = 0; $failed = 0
function Test-Step($Name, $ScriptBlock) {
  Write-Host "`n=== $Name ===" -ForegroundColor Cyan
  try { & $ScriptBlock; Write-Host "PASS: $Name" -ForegroundColor Green; $script:passed++ }
  catch { Write-Host "FAIL: $Name - $_" -ForegroundColor Red; $script:failed++ }
}
Test-Step "1. GET /api/health" { $r = Invoke-RestMethod -Uri "$BackendUrl/api/health"; if ($r.status -ne "ok") { throw "bad" } }
Test-Step "2. GET /api/embed/seylan-demo" { $r = Invoke-WebRequest -Uri "$BackendUrl/api/embed/seylan-demo"; if ($r.Content.Length -lt 50) { throw "empty" } }
$visitorId = $null; $businessId = $null
Test-Step "3. POST /api/fingerprint" {
  $body = '{"embedKey":"seylan-demo","fingerprint":"demo-sarangan-fp","path":"/pricing","title":"Gold","language":"en"}'
  $r = Invoke-RestMethod -Uri "$BackendUrl/api/fingerprint" -Method Post -Body $body -ContentType "application/json"
  $script:visitorId = $r.data.visitorId; $script:businessId = $r.data.businessId
}
Test-Step "4. POST /api/pipeline" {
  $body = "{`"visitorId`":`"$visitorId`",`"businessId`":`"$businessId`",`"waitForCrmMs`":500}"
  $r = Invoke-RestMethod -Uri "$BackendUrl/api/pipeline" -Method Post -Body $body -ContentType "application/json"
  if (-not $r.success) { throw "fail" }
}
if ($N8nSecret) {
  Test-Step "5. POST /api/webhooks/n8n/crm" {
    $body = "{`"visitorId`":`"$visitorId`",`"crmId`":`"CRM-001`",`"crmData`":{`"name`":`"Sarangan`",`"email`":`"t@t.com`",`"accountType`":`"prospect`",`"churnRisk`":`"low`",`"notes`":`"test`"}}"
    Invoke-RestMethod -Uri "$BackendUrl/api/webhooks/n8n/crm" -Method Post -Body $body -ContentType "application/json" -Headers @{"X-Webhook-Secret"=$N8nSecret} | Out-Null
  }
}
if ($BpSecret -and $visitorId) {
  Test-Step "7. POST /api/webhooks/beyondpresence/session" {
    $body = "{`"visitorId`":`"$visitorId`",`"businessId`":`"$businessId`",`"transcript`":[{`"role`":`"user`",`"text`":`"hi`",`"timestamp`":0}],`"outcome`":`"informational`",`"sentimentArc`":[{`"turn`":1,`"score`":0.8}],`"actionItems`":[`"test`"],`"duration`":30}"
    Invoke-RestMethod -Uri "$BackendUrl/api/webhooks/beyondpresence/session" -Method Post -Body $body -ContentType "application/json" -Headers @{"X-BP-Webhook-Secret"=$BpSecret} | Out-Null
  }
}
Write-Host "`nPassed: $passed Failed: $failed"
if ($failed -gt 0) { exit 1 }
