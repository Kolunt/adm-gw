@echo off
echo Запуск проекта Анонимный Дед Мороз v0.0.65
echo.

echo Остановка существующих процессов...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo Удаление старой базы данных...
cd backend
if exist santa.db del santa.db

echo.
echo Запуск backend...
start "Backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8006 --reload"

echo.
echo Ожидание запуска backend...
timeout /t 5 /nobreak

echo.
echo Запуск frontend...
cd ..
start "Frontend" cmd /k "npm start"

echo.
echo Проект запущен!
echo Backend: http://127.0.0.1:8006
echo Frontend: http://localhost:3000
echo.
pause
