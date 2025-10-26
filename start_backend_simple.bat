@echo off
echo Starting backend on port 8004...
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8004 --reload
