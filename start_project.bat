@echo off
echo ========================================
echo   Анонимный Дед Мороз - Запуск проекта
echo ========================================
echo.

echo [1/3] Остановка всех процессов Python...
taskkill /f /im python.exe > nul 2>&1
echo ✓ Процессы остановлены

echo.
echo [2/3] Удаление старой базы данных...
if exist backend\santa.db del backend\santa.db > nul 2>&1
echo ✓ База данных удалена

echo.
echo [3/3] Запуск backend на порту 8004...
cd backend
start "Backend Server" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8004 --reload"
echo ✓ Backend запущен в отдельном окне

echo.
echo ========================================
echo   Проект запущен!
echo   Backend: http://localhost:8004
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause > nul
