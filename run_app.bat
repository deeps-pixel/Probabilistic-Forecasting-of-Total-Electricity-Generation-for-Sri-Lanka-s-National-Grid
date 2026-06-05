@echo off
echo Starting Grid Copilot Backend (Port 8001)...
start "" cmd /c "python backend.py"
timeout /t 5
echo Starting Dashboard Frontend (Port 8000)...
start "" cmd /c "python -m http.server 8000"
timeout /t 2
echo Dashboard is ready!
start "" http://localhost:8000
