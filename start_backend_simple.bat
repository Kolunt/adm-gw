@echo off
cd /d "%~dp0"
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8006 --reload
pause