@echo off
echo ========================================
echo  АНОНИМНЫЙ ДЕД МОРОЗ - ПОЛНЫЙ ЗАПУСК
echo ========================================
echo.

echo [1/5] Остановка всех процессов...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
echo Процессы остановлены

echo [2/5] Ожидание завершения процессов...
timeout /t 3 /nobreak >nul

echo [3/5] Удаление старой базы данных...
cd backend
if exist santa.db del santa.db
echo База данных удалена

echo [4/5] Запуск backend сервера...
start "Backend Server" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8006 --reload"
echo Backend запускается на http://localhost:8006

echo [5/5] Ожидание запуска backend...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  ЗАПУСК FRONTEND
echo ========================================
echo.
echo Frontend запускается на http://localhost:3000
echo Нажмите Ctrl+C для остановки frontend
echo.

cd ..
npm start

pause
