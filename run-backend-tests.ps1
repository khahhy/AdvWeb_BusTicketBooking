# Script to run backend tests only
# Usage: .\run-backend-tests.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Tests - NestJS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "server"

# Check if server directory exists
if (-not (Test-Path $serverPath)) {
    Write-Host "Error: Server directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $serverPath

# Check for dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Green
npm run test:cov

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✓ All backend tests passed!" -ForegroundColor Green
    Write-Host "Coverage report: server/coverage/lcov-report/index.html" -ForegroundColor Gray
} else {
    Write-Host "✗ Some backend tests failed!" -ForegroundColor Red
}

exit $exitCode
