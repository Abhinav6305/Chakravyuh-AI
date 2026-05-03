$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Test-Port($port) {
  $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  return $null -ne $connection
}

if (Test-Port 8000) {
  Write-Host "Backend already running on http://127.0.0.1:8000"
} else {
  Write-Host "Starting Chakravyuh AI backend on http://127.0.0.1:8000"
  Start-Process powershell -WindowStyle Normal -ArgumentList @(
    "-NoProfile",
    "-Command",
    "Set-Location '$backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
  )
}

if (Test-Port 3000) {
  Write-Host "Frontend already running on http://localhost:3000"
} else {
  Write-Host "Starting Chakravyuh AI frontend on http://localhost:3000"
  Start-Process powershell -WindowStyle Normal -ArgumentList @(
    "-NoProfile",
    "-Command",
    "Set-Location '$frontend'; npm run dev"
  )
}

Write-Host ""
Write-Host "Demo login:"
Write-Host "  Bank ID: DEMO"
Write-Host "  Password: demo123"
