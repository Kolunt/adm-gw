@echo off
echo Starting Anonymous Santa Project...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8006 --reload"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8006
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul