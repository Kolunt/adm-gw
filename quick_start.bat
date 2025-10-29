@echo off
chcp 65001 >nul
echo ========================================
echo    БЫСТРЫЙ ЗАПУСК ПРОЕКТА
echo ========================================

echo Останавливаем старые процессы...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo Запускаем бэкенд...
start "Backend" cmd /k "cd backend && python main.py"

echo Ждем 3 секунды...
timeout /t 3 /nobreak >nul

echo Запускаем фронтенд...
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo    ГОТОВО! Откройте http://localhost:3000
echo ========================================
pause
