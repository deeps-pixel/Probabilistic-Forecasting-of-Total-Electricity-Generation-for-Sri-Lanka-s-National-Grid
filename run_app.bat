@echo off
title Energy Dashboard Launcher

echo Sri Lanka Energy Grid AI Dashboard

echo.

REM Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Creating...
    python -m venv .venv
    echo Installing dependencies...
    .venv\Scripts\pip install -r requirements.txt
)

echo Starting Backend Server (Port 8001)...
start "Energy Backend" cmd /k ".venv\Scripts\activate && python backend.py"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server (Port 8000)...
start "Energy Frontend" cmd /k "python -m http.server 8000"

timeout /t 2 /nobreak >nul

echo.
echo Dashboard is ready!
echo Open http://localhost:8000 in your browser

echo.
echo Close these windows to stop the servers.

start "" http://localhost:8000
