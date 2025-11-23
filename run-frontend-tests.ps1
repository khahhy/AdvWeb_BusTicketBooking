# Script to run frontend tests only
# Usage: .\run-frontend-tests.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Tests - React + Vitest" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientPath = Join-Path $scriptPath "client"

# Check if client directory exists
if (-not (Test-Path $clientPath)) {
    Write-Host "Error: Client directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $clientPath

# Check for dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Green
npm run test:coverage

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✓ All frontend tests passed!" -ForegroundColor Green
    Write-Host "Coverage report: client/coverage/index.html" -ForegroundColor Gray
} else {
    Write-Host "✗ Some frontend tests failed!" -ForegroundColor Red
}

exit $exitCode
