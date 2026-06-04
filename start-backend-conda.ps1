#!/usr/bin/env pwsh

# Start Backend using Conda LLM Environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend (Conda LLM Env)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Path to conda environment
$condaPython = "C:\Users\harsh\anaconda3\envs\llm\python.exe"

# Check if conda Python exists
if (-not (Test-Path $condaPython)) {
    Write-Host "ERROR: Conda Python not found at: $condaPython" -ForegroundColor Red
    Write-Host "Please verify your anaconda installation path" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Using Python from: $condaPython" -ForegroundColor Green
Write-Host "Backend will be available at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the backend with conda Python
& $condaPython -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
