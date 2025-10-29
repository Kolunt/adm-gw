@echo off
echo ========================================
echo    ЗАПУСК ПРОЕКТА АНОНИМНЫЙ ДЕД МОРОЗ
echo ========================================

echo.
echo [1/3] Останавливаем все процессы на портах 3000 и 8006...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8006') do taskkill /PID %%a /F >nul 2>&1

echo [2/3] Запускаем бэкенд на порту 8006...
cd backend
start "Backend Server" cmd /k "python main.py"
cd ..

echo [3/3] Запускаем фронтенд на порту 3000...
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo    ПРОЕКТ ЗАПУЩЕН!
echo    Фронтенд: http://localhost:3000
echo    Бэкенд:   http://localhost:8006
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
