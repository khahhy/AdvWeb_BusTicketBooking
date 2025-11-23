# Script to run all tests for Bus Ticket Booking System
# Usage: .\run-all-tests.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bus Ticket Booking - Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if directory exists
function Test-Directory {
    param($path)
    Test-Path $path
}

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = $scriptPath

# Backend Tests
Write-Host "Running Backend Tests..." -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow
$serverPath = Join-Path $rootPath "server"

if (Test-Directory $serverPath) {
    Set-Location $serverPath
    
    Write-Host "Installing backend dependencies if needed..." -ForegroundColor Gray
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    
    Write-Host "Running NestJS tests with coverage..." -ForegroundColor Green
    npm run test:cov
    
    $backendExitCode = $LASTEXITCODE
    Write-Host ""
} else {
    Write-Host "Backend directory not found!" -ForegroundColor Red
    $backendExitCode = 1
}

# Frontend Tests
Write-Host "Running Frontend Tests..." -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow
$clientPath = Join-Path $rootPath "client"

if (Test-Directory $clientPath) {
    Set-Location $clientPath
    
    Write-Host "Installing frontend dependencies if needed..." -ForegroundColor Gray
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    
    Write-Host "Running Vitest tests with coverage..." -ForegroundColor Green
    npm run test:coverage
    
    $frontendExitCode = $LASTEXITCODE
    Write-Host ""
} else {
    Write-Host "Frontend directory not found!" -ForegroundColor Red
    $frontendExitCode = 1
}

# Return to root
Set-Location $rootPath

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($backendExitCode -eq 0) {
    Write-Host "✓ Backend Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "✗ Backend Tests: FAILED" -ForegroundColor Red
}

if ($frontendExitCode -eq 0) {
    Write-Host "✓ Frontend Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend Tests: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "Coverage Reports:" -ForegroundColor Yellow
Write-Host "  Backend:  server/coverage/lcov-report/index.html" -ForegroundColor Gray
Write-Host "  Frontend: client/coverage/index.html" -ForegroundColor Gray
Write-Host ""

# Exit with error if any tests failed
if ($backendExitCode -ne 0 -or $frontendExitCode -ne 0) {
    Write-Host "Some tests failed!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
}
