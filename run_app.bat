@echo off
rem ------------------------------------------------------------
rem Energy Dashboard – Unified Startup Script
rem ------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

rem Activate virtual environment if it exists
if exist ".venv\Scripts\activate" (
    call .venv\Scripts\activate
)

rem Kill any existing process using port 8001 (backend)
powershell -Command "$p = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue; if ($p) {Stop-Process -Id $p.OwningProcess -Force}" >nul 2>&1

rem Start Backend (FastAPI) on port 8001
start "" cmd /c "python backend.py"
timeout /t 5 >nul

rem Start Frontend (Static Server) on port 8000
start "" cmd /c "python -m http.server 8000"
timeout /t 2 >nul

rem Open Dashboard in default browser
start "" http://localhost:8000
