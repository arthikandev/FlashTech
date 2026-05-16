# PresenceIQ hour-20 integration tests (PowerShell)
# Usage: $env:BACKEND_URL="http://localhost:3000"; $env:N8N_WEBHOOK_SECRET="..."; .\integration-test.ps1

param(
  [string]$BackendUrl = $env:BACKEND_URL,
  [string]$N8nSecret = $env:N8N_WEBHOOK_SECRET,
  [string]$BpSecret = $env:BP_WEBHOOK_SECRET
)

if (-not $BackendUrl) {
  Write-Error "Set BACKEND_URL or pass -BackendUrl"
  exit 1
}

$BackendUrl = $BackendUrl.TrimEnd("/")
$passed = 0
$failed = 0

function Test-Step($Name, $ScriptBlock) {
  Write-Host "`n=== $Name ===" -ForegroundColor Cyan
  try {
    & $ScriptBlock
    Write-Host "PASS: $Name" -ForegroundColor Green
    $script:passed++
  } catch {
    Write-Host "FAIL: $Name — $_" -ForegroundColor Red
    $script:failed++
  }
}

Test-Step "1. GET /api/health" {
  $r = Invoke-RestMethod -Uri "$BackendUrl/api/health" -Method Get
  if ($r.status -ne "ok") { throw "status not ok" }
}

Test-Step "2. GET /api/embed/seylan-demo" {
  $r = Invoke-WebRequest -Uri "$BackendUrl/api/embed/seylan-demo" -Method Get
  if ($r.StatusCode -ne 200) { throw "non-200" }
  if ($r.Content.Length -lt 50) { throw "empty embed" }
}

$visitorId = $null
$businessId = $null

Test-Step "3. POST /api/fingerprint" {
  $body = @{
    embedKey = "seylan-demo"
    fingerprint = "demo-sarangan-fp"
    path = "/pricing"
    title = "Gold vs Platinum"
    language = "en"
  } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$BackendUrl/api/fingerprint" -Method Post -Body $body -ContentType "application/json"
  if (-not $r.success) { throw "fingerprint failed" }
  $script:visitorId = $r.data.visitorId
  $script:businessId = $r.data.businessId
}

Test-Step "4. POST /api/pipeline" {
  if (-not $visitorId) { throw "no visitorId from step 3" }
  $body = @{
    visitorId = $visitorId
    businessId = $businessId
    waitForCrmMs = 500
  } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$BackendUrl/api/pipeline" -Method Post -Body $body -ContentType "application/json"
  if (-not $r.success) { throw "pipeline failed" }
  $opener = $r.data.intelligence.personalisedOpener
  if ($opener -notmatch "Sarangan") { Write-Warning "opener may not mention Sarangan: $opener" }
  if ($r.data.pipelineMs -gt 2000) { Write-Warning "pipelineMs $($r.data.pipelineMs) > 2000" }
}

if ($N8nSecret) {
  Test-Step "5. POST /api/webhooks/n8n/crm" {
    $body = @{
      visitorId = $visitorId
      crmId = "CRM-001"
      crmData = @{
        name = "Sarangan"
        email = "sarangan@example.com"
        accountType = "prospect"
        churnRisk = "low"
        notes = "Integration test"
      }
    } | ConvertTo-Json -Depth 5
    $headers = @{ "X-Webhook-Secret" = $N8nSecret }
    Invoke-RestMethod -Uri "$BackendUrl/api/webhooks/n8n/crm" -Method Post -Body $body -ContentType "application/json" -Headers $headers | Out-Null
  }
} else {
  Write-Host "`nSKIP 5: N8N_WEBHOOK_SECRET not set" -ForegroundColor Yellow
}

if ($BpSecret -and $visitorId) {
  Test-Step "7. POST /api/webhooks/beyondpresence/session" {
    $body = @{
      visitorId = $visitorId
      businessId = $businessId
      transcript = @(
        @{ role = "user"; text = "Hello"; timestamp = [int][double]::Parse((Get-Date -UFormat %s)) }
      )
      outcome = "informational"
      sentimentArc = @(@{ turn = 1; score = 0.8 })
      actionItems = @("Integration test")
      duration = 30
    } | ConvertTo-Json -Depth 5
    $headers = @{ "X-BP-Webhook-Secret" = $BpSecret }
    Invoke-RestMethod -Uri "$BackendUrl/api/webhooks/beyondpresence/session" -Method Post -Body $body -ContentType "application/json" -Headers $headers | Out-Null
  }
} else {
  Write-Host "`nSKIP 7: BP_WEBHOOK_SECRET not set" -ForegroundColor Yellow
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed  Failed: $failed"
Write-Host "Steps 6, 8, 9 require manual check (live avatar, Slack, dashboard)."
if ($failed -gt 0) { exit 1 }
