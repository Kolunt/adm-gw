@echo off
echo ========================================
echo    ОСТАНОВКА ПРОЕКТА
echo ========================================

echo Останавливаем все процессы на портах 3000 и 8006...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8006') do taskkill /PID %%a /F >nul 2>&1

echo.
echo Все процессы остановлены!
echo.
pause
