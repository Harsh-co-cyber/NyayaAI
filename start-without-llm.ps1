#!/usr/bin/env pwsh

# BNS System - Section Retrieval Only (No LM Studio Required)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BNS Section Retrieval - Testing Mode                 ║" -ForegroundColor Cyan
Write-Host "║   (No LM Studio Required)                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  NOTE: FIR generation will NOT work without LM Studio" -ForegroundColor Yellow
Write-Host "✅ Section retrieval WILL work" -ForegroundColor Green
Write-Host ""

# Check if Node is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Backend will run on: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "python -m uvicorn main:app --reload" `
    -WindowStyle Normal

Write-Host "Backend started in new window" -ForegroundColor Green
Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies (first time only)..." -ForegroundColor Yellow
    Set-Location -Path "frontend"
    npm install
    Set-Location -Path ".."
}

Set-Location -Path "frontend"
Write-Host ""
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ System Ready!" -ForegroundColor Green
Write-Host "  📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  📍 Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  📍 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "✅ You can test: Section Retrieval" -ForegroundColor Green
Write-Host "❌ FIR Generation will fail (needs LM Studio)" -ForegroundColor Yellow
Write-Host ""

npm run dev
