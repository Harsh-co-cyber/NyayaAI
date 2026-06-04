# Start Backend Server
# This script starts the FastAPI backend for BNS/CrPC Section Retrieval

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BNS/CrPC Section Retrieval Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Virtual environment not detected. Activating..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the backend
python main.py
