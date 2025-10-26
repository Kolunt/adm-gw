@echo off
echo Остановка всех Python процессов...
taskkill /f /im python.exe 2>nul

echo Переход в директорию backend...
cd backend

echo Удаление старой базы данных...
if exist santa.db del santa.db

echo Запуск backend сервера...
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload

pause

